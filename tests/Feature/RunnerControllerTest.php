<?php

namespace Tests\Feature;

use App\Enums\QuestionType;
use App\Enums\RunnerStage;
use App\Http\Requests\RunnerSessionRequest;
use App\Models\Test\Test;
use App\Models\Test\TestAnswer;
use App\Models\Test\TestAttempt;
use App\Models\Test\TestQuestion;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class RunnerControllerTest extends TestCase
{
    private const PARTICIPANT_REQUIRED_MESSAGE = 'Имя и фамилия обязательно для заполнения';

    private Test $test;

    /** @var array<int, TestQuestion> */
    private array $questions = [];

    /** @var array<int, array{correct: TestAnswer, wrong: TestAnswer}> */
    private array $answers = [];

    private string $sessionKey;

    protected function setUp(): void
    {
        parent::setUp();

        $this->test = $this->createTest(attempts: 2);
        $this->sessionKey = (string) Str::uuid();

        foreach ($this->test->questions()->with('answers')->get() as $question) {
            $this->questions[] = $question;
            $this->answers[] = [
                'correct' => $question->answers[0],
                'wrong' => $question->answers[1],
            ];
        }
    }

    public function test_state_requires_session_header(): void
    {
        $this->getJson(route('web.runner.state', $this->test->link))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['session_key']);
    }

    public function test_state_rejects_non_uuid_session_key(): void
    {
        $this->withHeader(RunnerSessionRequest::SESSION_HEADER, 'not-a-uuid')
            ->getJson(route('web.runner.state', $this->test->link))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['session_key']);
    }

    public function test_state_returns_not_found_for_unknown_link(): void
    {
        $this->runnerGet('state', (string) Str::uuid())
            ->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'TEST_NOT_FOUND',
            ]);
    }

    public function test_state_returns_intro_for_new_session(): void
    {
        $this->runnerGet('state')
            ->assertOk()
            ->assertExactJson([
                'stage' => RunnerStage::Intro->value,
                'test' => [
                    'id' => (string) $this->test->id,
                    'title' => $this->test->title,
                    'description' => $this->test->description,
                    'questionsCount' => 2,
                ],
                'questions' => [],
                'answers' => [],
                'currentQuestionId' => null,
                'participant' => null,
                'result' => null,
            ]);
    }

    public function test_state_returns_result_for_finished_attempt(): void
    {
        TestAttempt::factory()->for($this->test)->create([
            'user_id' => null,
            'first_name' => 'Иван',
            'last_name' => 'Иванов',
            'session_key' => $this->sessionKey,
            'score' => 1,
            'answers' => [
                (string) $this->questions[0]->id => (string) $this->answers[0]['correct']->id,
                (string) $this->questions[1]->id => (string) $this->answers[1]['wrong']->id,
            ],
            'started_at' => now(),
            'finished_at' => now(),
        ]);

        $this->runnerGet('state')
            ->assertOk()
            ->assertJsonPath('stage', RunnerStage::Result->value)
            ->assertJsonPath('participant', ['firstName' => 'Иван', 'lastName' => 'Иванов'])
            ->assertJsonPath('result.correctCount', 1)
            ->assertJsonPath('result.totalCount', 2)
            ->assertJsonPath('result.percent', 50)
            ->assertJsonPath('result.status', 'normal');
    }

    public function test_start_requires_participant_name(): void
    {
        $this->runnerPost('start', [
            'first_name' => '',
            'last_name' => '   ',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'first_name' => self::PARTICIPANT_REQUIRED_MESSAGE,
                'last_name' => self::PARTICIPANT_REQUIRED_MESSAGE,
            ]);

        $this->assertSame(0, $this->attemptsCount());
    }

    public function test_start_requires_last_name_with_same_message(): void
    {
        $this->runnerPost('start', [
            'first_name' => 'Иван',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['last_name' => self::PARTICIPANT_REQUIRED_MESSAGE])
            ->assertJsonMissingValidationErrors(['first_name']);
    }

    public function test_start_requires_first_name_with_same_message(): void
    {
        $this->runnerPost('start', [
            'last_name' => 'Иванов',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['first_name' => self::PARTICIPANT_REQUIRED_MESSAGE])
            ->assertJsonMissingValidationErrors(['last_name']);
    }

    public function test_start_limits_participant_name_length(): void
    {
        $this->runnerPost('start', [
            'first_name' => str_repeat('a', 101),
            'last_name' => str_repeat('a', 101),
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['first_name', 'last_name'])
            ->assertJsonMissing(['message' => self::PARTICIPANT_REQUIRED_MESSAGE]);
    }

    public function test_start_returns_not_found_for_unknown_link(): void
    {
        $this->runnerPost('start', $this->participantPayload(), (string) Str::uuid())
            ->assertStatus(404)
            ->assertJsonPath('error', 'TEST_NOT_FOUND');
    }

    public function test_start_creates_attempt_and_opens_first_question(): void
    {
        $response = $this->runnerPost('start', $this->participantPayload());

        $response
            ->assertOk()
            ->assertJsonPath('stage', RunnerStage::Question->value)
            ->assertJsonPath('currentQuestionId', (string) $this->questions[0]->id)
            ->assertJsonPath('participant', ['firstName' => 'Иван', 'lastName' => 'Иванов'])
            ->assertJsonPath('answers', [])
            ->assertJsonPath('result', null)
            ->assertJsonCount(2, 'questions')
            ->assertJsonPath('questions.0', [
                'id' => (string) $this->questions[0]->id,
                'type' => QuestionType::Single->value,
                'text' => $this->questions[0]->text,
                'answers' => [
                    ['id' => (string) $this->answers[0]['correct']->id, 'text' => $this->answers[0]['correct']->text],
                    ['id' => (string) $this->answers[0]['wrong']->id, 'text' => $this->answers[0]['wrong']->text],
                ],
            ]);

        $this->assertDatabaseHas('test_attempts', [
            'test_id' => $this->test->id,
            'session_key' => $this->sessionKey,
            'first_name' => 'Иван',
            'last_name' => 'Иванов',
            'finished_at' => null,
        ]);
    }

    public function test_start_twice_does_not_create_second_attempt(): void
    {
        $this->runnerPost('start', $this->participantPayload())->assertOk();
        $this->runnerPost('answer', $this->answerPayload(0, 'correct'))->assertOk();

        $this->runnerPost('start', [
            'first_name' => 'Пётр',
            'last_name' => 'Петров',
        ])
            ->assertOk()
            ->assertJsonPath('participant', ['firstName' => 'Иван', 'lastName' => 'Иванов'])
            ->assertJsonPath('answers', [
                (string) $this->questions[0]->id => (string) $this->answers[0]['correct']->id,
            ]);

        $this->assertSame(1, $this->attemptsCount());
    }

    public function test_start_is_forbidden_when_attempts_exceeded(): void
    {
        $this->finishAttempt();
        $this->finishAttempt();

        $this->runnerPost('start', $this->participantPayload())
            ->assertStatus(403)
            ->assertJsonPath('error', 'RUNNER_ATTEMPTS_EXCEEDED');

        $this->assertSame(2, $this->attemptsCount());
    }

    public function test_answer_validates_payload(): void
    {
        $this->runnerPost('answer', [
            'question_id' => 'abc',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['question_id', 'answer_id']);
    }

    public function test_answer_requires_started_attempt(): void
    {
        $this->runnerPost('answer', $this->answerPayload(0, 'correct'))
            ->assertStatus(404)
            ->assertJsonPath('error', 'RUNNER_ATTEMPT_NOT_FOUND');
    }

    public function test_answer_rejects_answer_from_another_question(): void
    {
        $this->runnerPost('start', $this->participantPayload())->assertOk();

        $this->runnerPost('answer', [
            'question_id' => $this->questions[0]->id,
            'answer_id' => $this->answers[1]['correct']->id,
        ])
            ->assertStatus(422)
            ->assertJsonPath('error', 'RUNNER_INVALID_ANSWER');
    }

    public function test_answer_rejects_question_from_another_test(): void
    {
        $foreignTest = $this->createTest();

        $this->runnerPost('start', $this->participantPayload())->assertOk();

        $this->runnerPost('answer', [
            'question_id' => $foreignTest->questions()->value('id'),
            'answer_id' => $this->answers[0]['correct']->id,
        ])
            ->assertStatus(422)
            ->assertJsonPath('error', 'RUNNER_INVALID_ANSWER');
    }

    public function test_answer_saves_selected_answer(): void
    {
        $this->runnerPost('start', $this->participantPayload())->assertOk();

        $this->runnerPost('answer', $this->answerPayload(1, 'wrong'))
            ->assertOk()
            ->assertJsonPath('stage', RunnerStage::Question->value)
            ->assertJsonPath('currentQuestionId', (string) $this->questions[1]->id)
            ->assertJsonPath('answers', [
                (string) $this->questions[1]->id => (string) $this->answers[1]['wrong']->id,
            ]);

        $this->runnerGet('state')
            ->assertOk()
            ->assertJsonPath('answers', [
                (string) $this->questions[1]->id => (string) $this->answers[1]['wrong']->id,
            ]);
    }

    public function test_answer_overwrites_previous_answer(): void
    {
        $this->runnerPost('start', $this->participantPayload())->assertOk();
        $this->runnerPost('answer', $this->answerPayload(0, 'wrong'))->assertOk();

        $this->runnerPost('answer', $this->answerPayload(0, 'correct'))
            ->assertOk()
            ->assertJsonPath('answers', [
                (string) $this->questions[0]->id => (string) $this->answers[0]['correct']->id,
            ]);
    }

    public function test_position_validates_stage(): void
    {
        $this->runnerPatch('position', [
            'stage' => 'unknown',
            'question_id' => $this->questions[0]->id,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['stage']);
    }

    public function test_position_requires_started_attempt(): void
    {
        $this->runnerPatch('position', [
            'stage' => RunnerStage::Finish->value,
            'question_id' => $this->questions[1]->id,
        ])
            ->assertStatus(404)
            ->assertJsonPath('error', 'RUNNER_ATTEMPT_NOT_FOUND');
    }

    public function test_position_rejects_question_from_another_test(): void
    {
        $foreignTest = $this->createTest();

        $this->runnerPost('start', $this->participantPayload())->assertOk();

        $this->runnerPatch('position', [
            'stage' => RunnerStage::Question->value,
            'question_id' => $foreignTest->questions()->value('id'),
        ])
            ->assertStatus(422)
            ->assertJsonPath('error', 'RUNNER_INVALID_QUESTION');
    }

    public function test_position_updates_stage_and_current_question(): void
    {
        $this->runnerPost('start', $this->participantPayload())->assertOk();

        $this->runnerPatch('position', [
            'stage' => RunnerStage::Finish->value,
            'question_id' => $this->questions[1]->id,
        ])
            ->assertOk()
            ->assertJsonPath('stage', RunnerStage::Finish->value)
            ->assertJsonPath('currentQuestionId', (string) $this->questions[1]->id);

        $this->runnerGet('state')
            ->assertOk()
            ->assertJsonPath('stage', RunnerStage::Finish->value)
            ->assertJsonPath('currentQuestionId', (string) $this->questions[1]->id);
    }

    public function test_finish_requires_started_attempt(): void
    {
        $this->runnerPost('finish')
            ->assertStatus(404)
            ->assertJsonPath('error', 'RUNNER_ATTEMPT_NOT_FOUND');
    }

    public function test_finish_requires_all_answers(): void
    {
        $this->runnerPost('start', $this->participantPayload())->assertOk();
        $this->runnerPost('answer', $this->answerPayload(0, 'correct'))->assertOk();

        $this->runnerPost('finish')
            ->assertStatus(422)
            ->assertJsonPath('error', 'RUNNER_NOT_COMPLETED');

        $this->assertDatabaseHas('test_attempts', [
            'session_key' => $this->sessionKey,
            'finished_at' => null,
        ]);
    }

    public function test_finish_saves_result_and_closes_attempt(): void
    {
        $this->runnerPost('start', $this->participantPayload())->assertOk();
        $this->runnerPost('answer', $this->answerPayload(0, 'correct'))->assertOk();
        $this->runnerPost('answer', $this->answerPayload(1, 'correct'))->assertOk();

        $this->runnerPost('finish')
            ->assertOk()
            ->assertExactJson([
                'items' => [
                    [
                        'number' => 1,
                        'questionText' => $this->questions[0]->text,
                        'selectedText' => $this->answers[0]['correct']->text,
                        'correctText' => $this->answers[0]['correct']->text,
                        'isCorrect' => true,
                    ],
                    [
                        'number' => 2,
                        'questionText' => $this->questions[1]->text,
                        'selectedText' => $this->answers[1]['correct']->text,
                        'correctText' => $this->answers[1]['correct']->text,
                        'isCorrect' => true,
                    ],
                ],
                'correctCount' => 2,
                'totalCount' => 2,
                'percent' => 100,
                'title' => 'Отличный результат!',
                'status' => 'success',
            ]);

        $attempt = TestAttempt::query()
            ->where('session_key', $this->sessionKey)
            ->sole();

        $this->assertSame(2, $attempt->score);
        $this->assertNotNull($attempt->finished_at);
        $this->assertSame([
            (string) $this->questions[0]->id => (string) $this->answers[0]['correct']->id,
            (string) $this->questions[1]->id => (string) $this->answers[1]['correct']->id,
        ], $attempt->answers);

        $this->runnerGet('state')
            ->assertOk()
            ->assertJsonPath('stage', RunnerStage::Result->value)
            ->assertJsonPath('result.correctCount', 2);

        $this->runnerPost('finish')
            ->assertStatus(404)
            ->assertJsonPath('error', 'RUNNER_ATTEMPT_NOT_FOUND');
    }

    public function test_finish_with_wrong_answers_returns_exception_status(): void
    {
        $this->runnerPost('start', $this->participantPayload())->assertOk();
        $this->runnerPost('answer', $this->answerPayload(0, 'wrong'))->assertOk();
        $this->runnerPost('answer', $this->answerPayload(1, 'wrong'))->assertOk();

        $this->runnerPost('finish')
            ->assertOk()
            ->assertJsonPath('items.0.isCorrect', false)
            ->assertJsonPath('items.0.selectedText', $this->answers[0]['wrong']->text)
            ->assertJsonPath('items.0.correctText', $this->answers[0]['correct']->text)
            ->assertJsonPath('correctCount', 0)
            ->assertJsonPath('percent', 0)
            ->assertJsonPath('title', 'Стоит попробовать ещё раз')
            ->assertJsonPath('status', 'exception');
    }

    public function test_sessions_are_isolated(): void
    {
        $this->runnerPost('start', $this->participantPayload())->assertOk();

        $this->sessionKey = (string) Str::uuid();

        $this->runnerGet('state')
            ->assertOk()
            ->assertJsonPath('stage', RunnerStage::Intro->value)
            ->assertJsonPath('participant', null);
    }

    private function createTest(int $attempts = 1): Test
    {
        $test = Test::factory()->create([
            'user_id' => User::factory(),
            'attempts' => $attempts,
        ]);

        TestQuestion::factory()
            ->for($test)
            ->withAnswers()
            ->count(2)
            ->sequence(['position' => 0], ['position' => 1])
            ->create();

        return $test;
    }

    private function finishAttempt(): void
    {
        $this->runnerPost('start', $this->participantPayload())->assertOk();
        $this->runnerPost('answer', $this->answerPayload(0, 'correct'))->assertOk();
        $this->runnerPost('answer', $this->answerPayload(1, 'correct'))->assertOk();
        $this->runnerPost('finish')->assertOk();
    }

    private function attemptsCount(): int
    {
        return TestAttempt::query()
            ->where('test_id', $this->test->id)
            ->where('session_key', $this->sessionKey)
            ->count();
    }

    /**
     * @return array{first_name: string, last_name: string}
     */
    private function participantPayload(): array
    {
        return [
            'first_name' => 'Иван',
            'last_name' => 'Иванов',
        ];
    }

    /**
     * @param 'correct'|'wrong' $variant
     * @return array{question_id: int, answer_id: int}
     */
    private function answerPayload(int $questionIndex, string $variant): array
    {
        return [
            'question_id' => $this->questions[$questionIndex]->id,
            'answer_id' => $this->answers[$questionIndex][$variant]->id,
        ];
    }

    private function runnerGet(string $action, ?string $link = null): TestResponse
    {
        return $this->withHeader(RunnerSessionRequest::SESSION_HEADER, $this->sessionKey)
            ->getJson(route("web.runner.$action", $link ?? $this->test->link));
    }

    private function runnerPost(string $action, array $payload = [], ?string $link = null): TestResponse
    {
        return $this->withHeader(RunnerSessionRequest::SESSION_HEADER, $this->sessionKey)
            ->postJson(route("web.runner.$action", $link ?? $this->test->link), $payload);
    }

    private function runnerPatch(string $action, array $payload = []): TestResponse
    {
        return $this->withHeader(RunnerSessionRequest::SESSION_HEADER, $this->sessionKey)
            ->patchJson(route("web.runner.$action", $this->test->link), $payload);
    }
}
