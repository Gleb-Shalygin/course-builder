<?php

namespace App\Service;

use App\Data\TestCreateData;
use App\Data\TestQuestionData;
use App\Exceptions\TestNotCreatedException;
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
            ->get(['id', 'title', 'description', 'is_public']);

        return $tests->map(fn ($test) => [
            'id' => $test->id,
            'title' => $test->title,
            'description' => $test->description,
            'is_public' => $test->is_public,
            'count_finished' => $test->count_finished
        ])->toArray();
    }

    /**
     * @throws TestNotCreatedException
     */
    public static function create(TestCreateData $data): array
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

            return [
                'id' => $test->id,
                'title' => $test->title,
                'description' => $test->description,
                'attempts' => $test->attempts,
                'is_public' => $test->is_public,
                'questions_count' => count($data->questions),
            ];
        });
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
