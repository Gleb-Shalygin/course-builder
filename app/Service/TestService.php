<?php

namespace App\Service;

use App\Data\TestQuestionData;
use App\Data\TestSaveData;
use App\Exceptions\TestNotCreatedException;
use App\Exceptions\TestNotFoundException;
use App\Exceptions\TestNotUpdatedException;
use App\Models\Test\Test;
use App\Models\Test\TestAnswer;
use App\Models\Test\TestQuestion;
use Illuminate\Support\Facades\DB;

class TestService
{
    public static function tests(): array
    {
        $user = auth()->user();
        $tests = Test::query()
            ->where('user_id', $user->id)
            ->withCount(['testAttempt as count_finished' => function ($query) {
                $query->whereNotNull('finished_at');
            }])
            ->orderByDesc('id')
            ->get(['id', 'title', 'description', 'is_public', 'attempts']);

        return $tests->map(fn ($test) => [
            'id' => $test->id,
            'title' => $test->title,
            'description' => $test->description,
            'is_public' => $test->is_public,
            'attempts' => $test->attempts,
            'count_finished' => $test->count_finished,
        ])->toArray();
    }

    /**
     * @throws TestNotFoundException
     */
    public static function test(int $testId): array
    {
        $test = self::userTest($testId);
        $test->load('questions.answers');

        return [
            'id' => $test->id,
            'title' => $test->title,
            'description' => $test->description,
            'attempts' => $test->attempts,
            'is_public' => $test->is_public,
            'questions' => $test->questions
                ->map(static fn (TestQuestion $question): array => self::questionPayload($question))
                ->toArray(),
        ];
    }

    /**
     * @throws TestNotCreatedException
     */
    public static function create(TestSaveData $data): array
    {
        $userId = auth()->id();

        if ($userId === null) {
            throw new TestNotCreatedException('Создавать тесты может только авторизованный пользователь');
        }

        return DB::transaction(static function () use ($data, $userId): array {
            $test = Test::query()->create([
                'user_id' => $userId,
                'title' => $data->title,
                'description' => $data->description,
                'attempts' => $data->attempts,
                'is_public' => false,
            ]);

            foreach ($data->questions as $position => $question) {
                self::createQuestion($test, $question, (int) $position);
            }

            return self::testPayload($test, count($data->questions));
        });
    }

    /**
     * @throws TestNotFoundException
     * @throws TestNotUpdatedException
     */
    public static function update(TestSaveData $data): array
    {
        $test = self::userTest($data->id);

        return DB::transaction(static function () use ($data, $test): array {
            $isUpdated = $test->update([
                'title' => $data->title,
                'description' => $data->description,
                'attempts' => $data->attempts,
            ]);

            if (!$isUpdated) {
                throw new TestNotUpdatedException('Не удалось сохранить изменения теста');
            }

            self::clearQuestions($test);

            foreach ($data->questions as $position => $question) {
                self::createQuestion($test, $question, (int) $position);
            }

            return self::testPayload($test, count($data->questions));
        });
    }

    /**
     * @throws TestNotFoundException
     */
    private static function userTest(?int $testId): Test
    {
        if ($testId === null) {
            throw new TestNotFoundException('Тест не найден');
        }

        $test = Test::query()
            ->where('id', $testId)
            ->where('user_id', auth()->id())
            ->first();

        if ($test === null) {
            throw new TestNotFoundException('Тест не найден');
        }

        return $test;
    }

    private static function testPayload(Test $test, int $questionsCount): array
    {
        return [
            'id' => $test->id,
            'title' => $test->title,
            'description' => $test->description,
            'attempts' => $test->attempts,
            'is_public' => $test->is_public,
            'questions_count' => $questionsCount,
        ];
    }

    private static function questionPayload(TestQuestion $question): array
    {
        return [
            'id' => $question->id,
            'type' => $question->type->value,
            'text' => $question->text,
            'answers' => $question->answers->map(static fn (TestAnswer $answer): array => [
                'id' => $answer->id,
                'text' => $answer->text,
                'is_correct' => (bool) $answer->pivot->is_correct,
            ])->toArray(),
        ];
    }

    private static function clearQuestions(Test $test): void
    {
        TestQuestion::query()
            ->where('test_id', $test->id)
            ->delete();

        TestAnswer::query()
            ->where('test_id', $test->id)
            ->delete();
    }

    private static function createQuestion(Test $test, TestQuestionData $data, int $position): void
    {
        /** @var TestQuestion $question */
        $question = $test->questions()->create([
            'type' => $data->type->value,
            'text' => $data->text,
            'position' => $position,
        ]);

        foreach ($data->answers as $answerPosition => $answerData) {
            $answer = TestAnswer::query()->create([
                'test_id' => $test->id,
                'text' => $answerData->text,
            ]);

            $question->answers()->attach($answer->id, [
                'is_correct' => $answerData->isCorrect,
                'position' => (int) $answerPosition,
            ]);
        }
    }
}
