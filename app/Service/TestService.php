<?php

namespace App\Service;

use App\Data\TestAnswerData;
use App\Data\TestQuestionData;
use App\Data\TestSaveData;
use App\Exceptions\TestNotCreatedException;
use App\Exceptions\TestNotFoundException;
use App\Exceptions\TestNotUpdatedException;
use App\Models\Test\Test;
use App\Models\Test\TestAnswer;
use App\Models\Test\TestQuestion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
            ->get(['id', 'link', 'title', 'description', 'is_public', 'attempts']);

        return $tests->map(static fn ($test) => [
            'id' => $test->id,
            'link' => self::testLink($test->link),
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
            'link' => self::testLink($test->link),
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
                'link' => (string) Str::uuid(),
                'title' => $data->title,
                'description' => $data->description,
                'attempts' => $data->attempts,
                'is_public' => false,
            ]);

            self::syncQuestions($test, $data->questions);

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

            self::syncQuestions($test, $data->questions);

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
            'link' => self::testLink($test->link),
            'title' => $test->title,
            'description' => $test->description,
            'attempts' => $test->attempts,
            'is_public' => $test->is_public,
            'questions_count' => $questionsCount,
        ];
    }

    private static function testLink(?string $token): ?string
    {
        if ($token === null) {
            return null;
        }

        return url("/tests/{$token}");
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

    /**
     * Приводит вопросы теста к переданному составу, сохраняя идентификаторы
     * уже существующих записей: на них ссылаются сохранённые попытки прохождения.
     *
     * @param array<int, TestQuestionData> $questions
     */
    private static function syncQuestions(Test $test, array $questions): void
    {
        $keptQuestionIds = [];
        $keptAnswerIds = [];

        foreach ($questions as $position => $questionData) {
            $question = self::saveQuestion($test, $questionData, (int) $position);
            $keptQuestionIds[] = $question->id;

            foreach (self::saveAnswers($test, $question, $questionData->answers) as $answerId) {
                $keptAnswerIds[] = $answerId;
            }
        }

        TestQuestion::query()
            ->where('test_id', $test->id)
            ->whereNotIn('id', $keptQuestionIds)
            ->delete();

        TestAnswer::query()
            ->where('test_id', $test->id)
            ->whereNotIn('id', $keptAnswerIds)
            ->delete();
    }

    private static function saveQuestion(Test $test, TestQuestionData $data, int $position): TestQuestion
    {
        $attributes = [
            'type' => $data->type->value,
            'text' => $data->text,
            'position' => $position,
        ];

        $question = $data->id === null
            ? null
            : $test->questions()->whereKey($data->id)->first();

        if ($question === null) {
            /** @var TestQuestion $created */
            $created = $test->questions()->create($attributes);

            return $created;
        }

        $question->update($attributes);

        return $question;
    }

    /**
     * @param array<int, TestAnswerData> $answers
     * @return array<int, int>
     */
    private static function saveAnswers(Test $test, TestQuestion $question, array $answers): array
    {
        $pivot = [];

        foreach ($answers as $position => $answerData) {
            $answer = self::saveAnswer($test, $answerData);

            $pivot[$answer->id] = [
                'is_correct' => $answerData->isCorrect,
                'position' => (int) $position,
            ];
        }

        $question->answers()->sync($pivot);

        return array_keys($pivot);
    }

    private static function saveAnswer(Test $test, TestAnswerData $data): TestAnswer
    {
        $answer = $data->id === null
            ? null
            : TestAnswer::query()
                ->where('test_id', $test->id)
                ->whereKey($data->id)
                ->first();

        if ($answer === null) {
            /** @var TestAnswer $created */
            $created = TestAnswer::query()->create([
                'test_id' => $test->id,
                'text' => $data->text,
            ]);

            return $created;
        }

        $answer->update(['text' => $data->text]);

        return $answer;
    }
}
