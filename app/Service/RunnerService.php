<?php

namespace App\Service;

use App\Data\Runner\RunnerAnswerData;
use App\Data\Runner\RunnerPositionData;
use App\Data\Runner\RunnerSessionData;
use App\Data\Runner\RunnerStartData;
use App\Enums\RunnerStage;
use App\Exceptions\RunnerAttemptNotFoundException;
use App\Exceptions\RunnerAttemptsExceededException;
use App\Exceptions\RunnerInvalidAnswerException;
use App\Exceptions\RunnerInvalidQuestionException;
use App\Exceptions\RunnerNotCompletedException;
use App\Exceptions\TestNotFoundException;
use App\Models\Test\Test;
use App\Models\Test\TestAttempt;
use App\Models\Test\TestQuestion;
use Illuminate\Support\Facades\Cache;

class RunnerService
{
    private const CACHE_TTL = 86400;
    private const SUCCESS_PERCENT = 80;
    private const NORMAL_PERCENT = 50;

    public static function intro(string $link): ?array
    {
        $test = self::findTest($link);

        if ($test === null) {
            return null;
        }

        return [
            'link' => $test->link,
            'title' => $test->title,
            'description' => $test->description,
            'questionsCount' => $test->questions()->count(),
        ];
    }

    /**
     * @throws TestNotFoundException
     */
    public static function state(RunnerSessionData $data): array
    {
        $test = self::requireTest($data->link);

        return self::buildState($test, $data->sessionKey);
    }

    /**
     * @throws TestNotFoundException
     * @throws RunnerAttemptsExceededException
     */
    public static function start(RunnerStartData $data): array
    {
        $test = self::requireTest($data->link);

        if (self::cached($test->id, $data->sessionKey) !== null) {
            return self::buildState($test, $data->sessionKey);
        }

        self::assertAttemptsLeft($test, $data->sessionKey);

        $attempt = TestAttempt::query()->create([
            'test_id' => $test->id,
            'first_name' => $data->firstName,
            'last_name' => $data->lastName,
            'session_key' => $data->sessionKey,
            'started_at' => now(),
        ]);

        self::putCache($test->id, $data->sessionKey, [
            'attempt_id' => $attempt->id,
            'stage' => RunnerStage::Question->value,
            'current_question_id' => self::firstQuestionId($test),
            'answers' => [],
        ]);

        return self::buildState($test, $data->sessionKey);
    }

    /**
     * @throws TestNotFoundException
     * @throws RunnerAttemptNotFoundException
     * @throws RunnerInvalidAnswerException
     */
    public static function answer(RunnerAnswerData $data): array
    {
        $test = self::requireTest($data->link);
        $cache = self::activeCache($test->id, $data->sessionKey);

        self::assertAnswerBelongsToTest($test, $data->questionId, $data->answerId);

        $cache['answers'][(string) $data->questionId] = (string) $data->answerId;
        $cache['stage'] = RunnerStage::Question->value;
        $cache['current_question_id'] = $data->questionId;

        self::putCache($test->id, $data->sessionKey, $cache);

        return self::buildState($test, $data->sessionKey);
    }

    /**
     * @throws TestNotFoundException
     * @throws RunnerAttemptNotFoundException
     * @throws RunnerInvalidQuestionException
     */
    public static function position(RunnerPositionData $data): array
    {
        $test = self::requireTest($data->link);
        $cache = self::activeCache($test->id, $data->sessionKey);

        self::assertQuestionBelongsToTest($test, $data->questionId);

        $cache['stage'] = $data->stage->value;
        $cache['current_question_id'] = $data->questionId;

        self::putCache($test->id, $data->sessionKey, $cache);

        return self::buildState($test, $data->sessionKey);
    }

    /**
     * @throws TestNotFoundException
     * @throws RunnerAttemptNotFoundException
     * @throws RunnerNotCompletedException
     */
    public static function finish(RunnerSessionData $data): array
    {
        $test = self::requireTest($data->link);
        $cache = self::activeCache($test->id, $data->sessionKey);

        $test->load('questions.answers');

        if (count($cache['answers']) !== $test->questions->count()) {
            throw new RunnerNotCompletedException('Нужно ответить на все вопросы');
        }

        $attempt = TestAttempt::query()->find($cache['attempt_id']);

        if ($attempt === null) {
            throw new RunnerAttemptNotFoundException('Попытка не найдена');
        }

        $result = self::calculate($test, $cache['answers']);

        $attempt->update([
            'score' => $result['correctCount'],
            'answers' => $cache['answers'],
            'finished_at' => now(),
        ]);

        self::forgetCache($test->id, $data->sessionKey);

        return $result;
    }

    /**
     * @throws TestNotFoundException
     */
    private static function requireTest(string $link): Test
    {
        $test = self::findTest($link);

        if ($test === null) {
            throw new TestNotFoundException('Тест не найден');
        }

        return $test;
    }

    private static function findTest(string $link): ?Test
    {
        return Test::query()
            ->where('link', $link)
            ->first();
    }

    private static function cacheKey(int $testId, string $sessionKey): string
    {
        return "runner:$testId:$sessionKey";
    }

    private static function cached(int $testId, string $sessionKey): ?array
    {
        $cache = Cache::get(self::cacheKey($testId, $sessionKey));

        return is_array($cache) ? $cache : null;
    }

    /**
     * @throws RunnerAttemptNotFoundException
     */
    private static function activeCache(int $testId, string $sessionKey): array
    {
        $cache = self::cached($testId, $sessionKey);

        if ($cache === null) {
            throw new RunnerAttemptNotFoundException('Попытка не начата или уже завершена');
        }

        return $cache;
    }

    private static function putCache(int $testId, string $sessionKey, array $cache): void
    {
        Cache::put(self::cacheKey($testId, $sessionKey), $cache, self::CACHE_TTL);
    }

    private static function forgetCache(int $testId, string $sessionKey): void
    {
        Cache::forget(self::cacheKey($testId, $sessionKey));
    }

    private static function buildState(Test $test, string $sessionKey): array
    {
        $state = [
            'stage' => RunnerStage::Intro->value,
            'test' => [
                'id' => (string) $test->id,
                'title' => $test->title,
                'description' => $test->description,
                'questionsCount' => $test->questions()->count(),
            ],
            'questions' => [],
            'answers' => [],
            'currentQuestionId' => null,
            'participant' => null,
            'result' => null,
        ];

        $cache = self::cached($test->id, $sessionKey);

        if ($cache === null) {
            $attempt = self::lastFinishedAttempt($test->id, $sessionKey);

            if ($attempt === null) {
                return $state;
            }

            $test->load('questions.answers');

            $state['stage'] = RunnerStage::Result->value;
            $state['answers'] = $attempt->answers ?? [];
            $state['participant'] = self::participant($attempt);
            $state['result'] = self::calculate($test, $state['answers']);

            return $state;
        }

        $attempt = TestAttempt::query()->find($cache['attempt_id']);

        $state['stage'] = $cache['stage'];
        $state['questions'] = self::questionsPayload($test);
        $state['answers'] = $cache['answers'];
        $state['currentQuestionId'] = self::currentQuestionId($cache);
        $state['participant'] = $attempt === null ? null : self::participant($attempt);

        return $state;
    }

    private static function firstQuestionId(Test $test): ?int
    {
        return $test->questions()->value('id');
    }

    private static function currentQuestionId(array $cache): ?string
    {
        $questionId = $cache['current_question_id'] ?? null;

        return $questionId === null ? null : (string) $questionId;
    }

    private static function participant(TestAttempt $attempt): array
    {
        return [
            'firstName' => $attempt->first_name,
            'lastName' => $attempt->last_name,
        ];
    }

    private static function lastFinishedAttempt(int $testId, string $sessionKey): ?TestAttempt
    {
        return TestAttempt::query()
            ->where('test_id', $testId)
            ->where('session_key', $sessionKey)
            ->whereNotNull('finished_at')
            ->orderByDesc('id')
            ->first();
    }


    private static function questionsPayload(Test $test): array
    {
        $test->load('questions.answers');

        return $test->questions->map(static fn (TestQuestion $question): array => [
            'id' => (string) $question->id,
            'type' => $question->type->value,
            'text' => $question->text,
            'answers' => $question->answers->map(static fn ($answer): array => [
                'id' => (string) $answer->id,
                'text' => $answer->text,
            ])->values()->toArray(),
        ])->values()->toArray();
    }

    /**
     * @throws RunnerAttemptsExceededException
     */
    private static function assertAttemptsLeft(Test $test, string $sessionKey): void
    {
        $used = TestAttempt::query()
            ->where('test_id', $test->id)
            ->where('session_key', $sessionKey)
            ->whereNotNull('finished_at')
            ->count();

        if ($used >= $test->attempts) {
            throw new RunnerAttemptsExceededException('Попытки прохождения закончились');
        }
    }

    /**
     * @throws RunnerInvalidQuestionException
     */
    private static function assertQuestionBelongsToTest(Test $test, int $questionId): void
    {
        $isValid = TestQuestion::query()
            ->where('id', $questionId)
            ->where('test_id', $test->id)
            ->exists();

        if (!$isValid) {
            throw new RunnerInvalidQuestionException('Вопрос не относится к этому тесту');
        }
    }

    /**
     * @throws RunnerInvalidAnswerException
     */
    private static function assertAnswerBelongsToTest(Test $test, int $questionId, int $answerId): void
    {
        $isValid = TestQuestion::query()
            ->where('id', $questionId)
            ->where('test_id', $test->id)
            ->whereHas('answers', static fn ($query) => $query->where('test_answers.id', $answerId))
            ->exists();

        if (!$isValid) {
            throw new RunnerInvalidAnswerException('Вариант ответа не относится к этому вопросу');
        }
    }


    private static function calculate(Test $test, array $answers): array
    {
        $items = $test->questions->map(static function (TestQuestion $question, int $index) use ($answers): array {
            $selectedId = $answers[(string) $question->id] ?? null;
            $selected = $question->answers->firstWhere('id', (int) $selectedId);
            $correct = $question->answers->first(static fn ($answer): bool => (bool) $answer->pivot->is_correct);

            return [
                'number' => $index + 1,
                'questionText' => $question->text,
                'selectedText' => $selected === null ? null : $selected->text,
                'correctText' => $correct === null ? '' : $correct->text,
                'isCorrect' => $correct !== null && $selectedId !== null && (int) $selectedId === $correct->id,
            ];
        })->values()->toArray();

        $totalCount = count($items);
        $correctCount = count(array_filter($items, static fn (array $item): bool => $item['isCorrect']));
        $percent = $totalCount === 0 ? 0 : (int) round($correctCount / $totalCount * 100);

        return [
            'items' => $items,
            'correctCount' => $correctCount,
            'totalCount' => $totalCount,
            'percent' => $percent,
            'title' => self::resultTitle($percent),
            'status' => self::resultStatus($percent),
        ];
    }

    private static function resultTitle(int $percent): string
    {
        if ($percent >= self::SUCCESS_PERCENT) {
            return 'Отличный результат!';
        }

        if ($percent >= self::NORMAL_PERCENT) {
            return 'Неплохо, но есть куда расти';
        }

        return 'Стоит попробовать ещё раз';
    }

    private static function resultStatus(int $percent): string
    {
        if ($percent >= self::SUCCESS_PERCENT) {
            return 'success';
        }

        if ($percent >= self::NORMAL_PERCENT) {
            return 'normal';
        }

        return 'exception';
    }
}
