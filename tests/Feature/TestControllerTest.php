<?php

namespace Tests\Feature;

use App\Enums\QuestionType;
use App\Models\Test\Test;
use App\Models\Test\TestAnswer;
use App\Models\Test\TestAttempt;
use App\Models\Test\TestQuestion;
use App\Models\User;
use Closure;
use Illuminate\Support\Facades\Auth;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TestControllerTest extends TestCase
{
    private const SINGLE_CORRECT_MESSAGE = 'В вопросе должен быть ровно один правильный ответ.';
    private const TRUE_FALSE_ANSWERS_MESSAGE = 'Вопрос «Да / Нет» должен содержать ровно два варианта ответа.';

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = Auth::user();
    }

    /**
     * @return array<string, array{string, string, bool}>
     */
    public static function guestRequests(): array
    {
        return [
            'index' => ['getJson', 'web.tests.index', false],
            'create' => ['postJson', 'web.tests.create', false],
            'show' => ['getJson', 'web.tests.show', true],
            'update' => ['putJson', 'web.tests.update', true],
        ];
    }

    /**
     * @return array<string, array{Closure(array<string, mixed>): array<string, mixed>, array<int|string, string>}>
     */
    public static function invalidPayloads(): array
    {
        return [
            'title missing' => [
                static fn (array $payload): array => self::without($payload, 'title'),
                ['title'],
            ],
            'title too long' => [
                static fn (array $payload): array => ['title' => str_repeat('а', 256)] + $payload,
                ['title'],
            ],
            'description too long' => [
                static fn (array $payload): array => ['description' => str_repeat('а', 1001)] + $payload,
                ['description'],
            ],
            'attempts missing' => [
                static fn (array $payload): array => self::without($payload, 'attempts'),
                ['attempts'],
            ],
            'attempts not integer' => [
                static fn (array $payload): array => ['attempts' => 'много'] + $payload,
                ['attempts'],
            ],
            'attempts below min' => [
                static fn (array $payload): array => ['attempts' => 0] + $payload,
                ['attempts'],
            ],
            'attempts above max' => [
                static fn (array $payload): array => ['attempts' => 100] + $payload,
                ['attempts'],
            ],
            'questions missing' => [
                static fn (array $payload): array => self::without($payload, 'questions'),
                ['questions'],
            ],
            'questions empty' => [
                static fn (array $payload): array => ['questions' => []] + $payload,
                ['questions'],
            ],
            'question type unknown' => [
                static function (array $payload): array {
                    $payload['questions'][0]['type'] = 'multiple';

                    return $payload;
                },
                ['questions.0.type'],
            ],
            'question text missing' => [
                static function (array $payload): array {
                    unset($payload['questions'][0]['text']);

                    return $payload;
                },
                ['questions.0.text'],
            ],
            'question text too long' => [
                static function (array $payload): array {
                    $payload['questions'][0]['text'] = str_repeat('а', 501);

                    return $payload;
                },
                ['questions.0.text'],
            ],
            'answers missing' => [
                static function (array $payload): array {
                    unset($payload['questions'][0]['answers']);

                    return $payload;
                },
                ['questions.0.answers'],
            ],
            'single answer' => [
                static function (array $payload): array {
                    $payload['questions'][0]['answers'] = [
                        ['text' => 'Париж', 'is_correct' => true],
                    ];

                    return $payload;
                },
                ['questions.0.answers'],
            ],
            'too many answers' => [
                static function (array $payload): array {
                    $answers = array_map(
                        static fn (int $index): array => ['text' => "Вариант $index", 'is_correct' => $index === 0],
                        range(0, 8)
                    );
                    $payload['questions'][0]['answers'] = $answers;

                    return $payload;
                },
                ['questions.0.answers'],
            ],
            'answer text missing' => [
                static function (array $payload): array {
                    unset($payload['questions'][0]['answers'][0]['text']);

                    return $payload;
                },
                ['questions.0.answers.0.text'],
            ],
            'answer text too long' => [
                static function (array $payload): array {
                    $payload['questions'][0]['answers'][0]['text'] = str_repeat('а', 256);

                    return $payload;
                },
                ['questions.0.answers.0.text'],
            ],
            'is_correct missing' => [
                static function (array $payload): array {
                    unset($payload['questions'][0]['answers'][0]['is_correct']);

                    return $payload;
                },
                ['questions.0.answers.0.is_correct'],
            ],
            'is_correct not boolean' => [
                static function (array $payload): array {
                    $payload['questions'][0]['answers'][0]['is_correct'] = 'да';

                    return $payload;
                },
                ['questions.0.answers.0.is_correct'],
            ],
            'no correct answer' => [
                static function (array $payload): array {
                    $payload['questions'][0]['answers'][1]['is_correct'] = false;

                    return $payload;
                },
                ['questions.0.answers' => self::SINGLE_CORRECT_MESSAGE],
            ],
            'two correct answers' => [
                static function (array $payload): array {
                    $payload['questions'][0]['answers'][0]['is_correct'] = true;

                    return $payload;
                },
                ['questions.0.answers' => self::SINGLE_CORRECT_MESSAGE],
            ],
            'true_false with three answers' => [
                static function (array $payload): array {
                    $payload['questions'][1]['answers'][] = ['text' => 'Не знаю', 'is_correct' => false];

                    return $payload;
                },
                ['questions.1.answers' => self::TRUE_FALSE_ANSWERS_MESSAGE],
            ],
        ];
    }

    #[DataProvider('guestRequests')]
    public function test_guest_is_unauthorized(string $method, string $route, bool $withTest): void
    {
        $test = $this->createOwnTest();
        $this->app['auth']->forgetGuards();

        $parameters = $withTest ? [$test->id] : [];

        $this->{$method}(route($route, $parameters), $this->payload())
            ->assertStatus(401);

        $this->assertSame(1, Test::query()->where('user_id', $this->user->id)->count());
    }

    public function test_index_returns_only_own_tests_in_descending_order(): void
    {
        $first = $this->createOwnTest();
        $second = $this->createOwnTest(['is_public' => true]);
        $this->createForeignTest();

        $this->getJson(route('web.tests.index'))
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    $this->listItem($second, 0),
                    $this->listItem($first, 0),
                ],
            ]);
    }

    public function test_index_counts_only_finished_attempts(): void
    {
        $test = $this->createOwnTest();

        TestAttempt::factory()->for($test)->count(2)->create(['finished_at' => now()]);
        TestAttempt::factory()->for($test)->create(['finished_at' => null]);
        TestAttempt::factory()->for($this->createForeignTest())->create(['finished_at' => now()]);

        $this->getJson(route('web.tests.index'))
            ->assertOk()
            ->assertExactJson([
                'data' => [$this->listItem($test, 2)],
            ]);
    }

    public function test_index_returns_empty_list_without_own_tests(): void
    {
        $this->createForeignTest();

        $this->getJson(route('web.tests.index'))
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    public function test_create_saves_test_with_questions_and_answers(): void
    {
        $payload = $this->payload();

        $response = $this->postJson(route('web.tests.create'), $payload)->assertCreated();

        $test = Test::query()->where('user_id', $this->user->id)->sole();

        $response->assertExactJson([
            'id' => $test->id,
            'link' => url("/tests/{$test->link}"),
            'title' => $payload['title'],
            'description' => $payload['description'],
            'is_public' => false,
            'attempts' => $payload['attempts'],
            'count_finished' => null,
        ]);

        $this->assertTrue(str()->isUuid($test->link));
        $this->assertFalse((bool) $test->is_public);
        $this->assertSame($payload['questions'], $this->storedQuestions($test));
        $this->assertSame(5, TestAnswer::query()->where('test_id', $test->id)->count());
    }

    public function test_create_without_description(): void
    {
        $payload = self::without($this->payload(), 'description');

        $this->postJson(route('web.tests.create'), $payload)
            ->assertCreated()
            ->assertJsonPath('description', null);

        $this->assertNull(Test::query()->where('user_id', $this->user->id)->sole()->description);
    }

    public function test_create_ignores_ids_of_foreign_records(): void
    {
        $foreignTest = $this->createForeignTest();
        [$foreignQuestion] = $this->seedQuestions($foreignTest);
        $foreignAnswer = $foreignQuestion->answers[0];

        $payload = $this->payload();
        $payload['questions'][0]['id'] = $foreignQuestion->id;
        $payload['questions'][0]['answers'][0]['id'] = $foreignAnswer->id;

        $this->postJson(route('web.tests.create'), $payload)->assertCreated();

        $test = Test::query()->where('user_id', $this->user->id)->sole();

        $this->assertNotContains($foreignQuestion->id, $test->questions()->pluck('id')->all());
        $this->assertSame($this->withoutIds($payload['questions']), $this->storedQuestions($test));
        $this->assertSame($foreignQuestion->text, $foreignQuestion->fresh()->text);
        $this->assertSame($foreignTest->id, $foreignQuestion->fresh()->test_id);
        $this->assertSame($foreignAnswer->text, $foreignAnswer->fresh()->text);
    }

    /**
     * @param Closure(array<string, mixed>): array<string, mixed> $mutate
     * @param array<int|string, string> $errors
     */
    #[DataProvider('invalidPayloads')]
    public function test_create_rejects_invalid_payload(Closure $mutate, array $errors): void
    {
        $this->postJson(route('web.tests.create'), $mutate($this->payload()))
            ->assertStatus(422)
            ->assertJsonValidationErrors($errors);

        $this->assertFalse(Test::query()->where('user_id', $this->user->id)->exists());
    }

    public function test_show_returns_test_with_ordered_questions_and_answers(): void
    {
        $test = $this->createOwnTest(['is_public' => true]);
        [$capital, $earth] = $this->seedQuestions($test);

        $this->getJson(route('web.tests.show', $test->id))
            ->assertOk()
            ->assertExactJson([
                'id' => $test->id,
                'link' => url("/tests/{$test->link}"),
                'title' => $test->title,
                'description' => $test->description,
                'attempts' => $test->attempts,
                'is_public' => true,
                'questions' => [
                    [
                        'id' => $capital->id,
                        'type' => QuestionType::Single->value,
                        'text' => 'Столица Франции?',
                        'answers' => [
                            ['id' => $capital->answers[0]->id, 'text' => 'Лондон', 'is_correct' => false],
                            ['id' => $capital->answers[1]->id, 'text' => 'Париж', 'is_correct' => true],
                            ['id' => $capital->answers[2]->id, 'text' => 'Берлин', 'is_correct' => false],
                        ],
                    ],
                    [
                        'id' => $earth->id,
                        'type' => QuestionType::TrueFalse->value,
                        'text' => 'Земля круглая?',
                        'answers' => [
                            ['id' => $earth->answers[0]->id, 'text' => 'Да', 'is_correct' => true],
                            ['id' => $earth->answers[1]->id, 'text' => 'Нет', 'is_correct' => false],
                        ],
                    ],
                ],
            ]);
    }

    public function test_show_returns_not_found_for_foreign_test(): void
    {
        $test = $this->createForeignTest();

        $this->getJson(route('web.tests.show', $test->id))
            ->assertStatus(404)
            ->assertJson(['success' => false, 'error' => 'TEST_NOT_FOUND']);
    }

    public function test_show_returns_not_found_for_unknown_test(): void
    {
        $this->getJson(route('web.tests.show', $this->unknownTestId()))
            ->assertStatus(404)
            ->assertJson(['success' => false, 'error' => 'TEST_NOT_FOUND']);
    }

    public function test_update_changes_test_fields_and_keeps_link(): void
    {
        $test = $this->createOwnTest(['is_public' => true]);
        $this->seedQuestions($test);
        $payload = $this->payload();

        $this->putJson(route('web.tests.update', $test->id), $payload)
            ->assertOk()
            ->assertExactJson([
                'id' => $test->id,
                'link' => url("/tests/{$test->link}"),
                'title' => $payload['title'],
                'description' => $payload['description'],
                'is_public' => true,
                'attempts' => $payload['attempts'],
                'count_finished' => null,
            ]);

        $fresh = $test->fresh();

        $this->assertSame($test->link, $fresh->link);
        $this->assertSame($this->user->id, $fresh->user_id);
        $this->assertTrue((bool) $fresh->is_public);
        $this->assertSame($payload['title'], $fresh->title);
        $this->assertSame($payload['description'], $fresh->description);
        $this->assertSame($payload['attempts'], $fresh->attempts);
    }

    public function test_update_keeps_ids_of_existing_questions_and_answers(): void
    {
        $test = $this->createOwnTest();
        [$capital, $earth] = $this->seedQuestions($test);
        [$london, $paris, $berlin] = $capital->answers;
        [$yes, $no] = $earth->answers;

        $payload = $this->payload();
        $payload['questions'] = [
            [
                'id' => $earth->id,
                'type' => QuestionType::TrueFalse->value,
                'text' => 'Земля плоская?',
                'answers' => [
                    ['id' => $yes->id, 'text' => 'Да', 'is_correct' => false],
                    ['id' => $no->id, 'text' => 'Нет', 'is_correct' => true],
                ],
            ],
            [
                'id' => $capital->id,
                'type' => QuestionType::Single->value,
                'text' => 'Столица Франции?',
                'answers' => [
                    ['id' => $paris->id, 'text' => 'Париж', 'is_correct' => true],
                    ['id' => $london->id, 'text' => 'Лондон, Великобритания', 'is_correct' => false],
                    ['id' => null, 'text' => 'Мадрид', 'is_correct' => false],
                ],
            ],
            [
                'id' => null,
                'type' => QuestionType::Single->value,
                'text' => 'Сколько будет 2 + 2?',
                'answers' => [
                    ['id' => null, 'text' => '3', 'is_correct' => false],
                    ['id' => null, 'text' => '4', 'is_correct' => true],
                ],
            ],
        ];

        $this->putJson(route('web.tests.update', $test->id), $payload)->assertOk();

        $this->assertSame($this->withoutIds($payload['questions']), $this->storedQuestions($test));

        $questionIds = $test->questions()->pluck('id')->all();
        $this->assertSame([$earth->id, $capital->id], array_slice($questionIds, 0, 2));
        $this->assertCount(3, $questionIds);

        $this->assertSame([$yes->id, $no->id], $earth->answers()->pluck('test_answers.id')->all());
        $this->assertSame(
            [$paris->id, $london->id],
            array_slice($capital->answers()->pluck('test_answers.id')->all(), 0, 2)
        );

        $this->assertModelMissing($berlin);
        $this->assertSame(7, TestAnswer::query()->where('test_id', $test->id)->count());
    }

    public function test_update_removes_questions_and_answers_missing_in_payload(): void
    {
        $test = $this->createOwnTest();
        [$capital, $earth] = $this->seedQuestions($test);

        $payload = $this->payload();
        $payload['questions'] = [
            [
                'id' => $capital->id,
                'type' => QuestionType::Single->value,
                'text' => 'Столица Франции?',
                'answers' => $capital->answers
                    ->map(static fn (TestAnswer $answer): array => [
                        'id' => $answer->id,
                        'text' => $answer->text,
                        'is_correct' => (bool) $answer->pivot->is_correct,
                    ])
                    ->all(),
            ],
        ];

        $this->putJson(route('web.tests.update', $test->id), $payload)->assertOk();

        $this->assertModelMissing($earth);

        foreach ($earth->answers as $answer) {
            $this->assertModelMissing($answer);
        }

        $this->assertSame([$capital->id], $test->questions()->pluck('id')->all());
        $this->assertSame($this->withoutIds($payload['questions']), $this->storedQuestions($test));
        $this->assertSame(3, TestAnswer::query()->where('test_id', $test->id)->count());
    }

    public function test_update_treats_foreign_ids_as_new_records(): void
    {
        $test = $this->createOwnTest();
        [$ownQuestion] = $this->seedQuestions($test);

        $foreignTest = $this->createForeignTest();
        [$foreignQuestion] = $this->seedQuestions($foreignTest);
        $foreignAnswer = $foreignQuestion->answers[0];

        $payload = $this->payload();
        $payload['questions'][0]['id'] = $foreignQuestion->id;
        $payload['questions'][0]['answers'][0]['id'] = $foreignAnswer->id;

        $this->putJson(route('web.tests.update', $test->id), $payload)->assertOk();

        $questionIds = $test->questions()->pluck('id')->all();

        $this->assertNotContains($foreignQuestion->id, $questionIds);
        $this->assertNotContains($ownQuestion->id, $questionIds);
        $this->assertSame($this->withoutIds($payload['questions']), $this->storedQuestions($test));

        $this->assertSame($foreignTest->id, $foreignQuestion->fresh()->test_id);
        $this->assertSame($foreignQuestion->text, $foreignQuestion->fresh()->text);
        $this->assertSame($foreignAnswer->text, $foreignAnswer->fresh()->text);
        $this->assertCount(2, $foreignTest->questions()->get());
    }

    public function test_update_returns_not_found_for_foreign_test(): void
    {
        $test = $this->createForeignTest();
        $this->seedQuestions($test);
        $questionsBefore = $this->storedQuestions($test);

        $this->putJson(route('web.tests.update', $test->id), $this->payload())
            ->assertStatus(404)
            ->assertJson(['success' => false, 'error' => 'TEST_NOT_FOUND']);

        $this->assertSame($test->title, $test->fresh()->title);
        $this->assertSame($questionsBefore, $this->storedQuestions($test));
    }

    public function test_update_returns_not_found_for_unknown_test(): void
    {
        $this->putJson(route('web.tests.update', $this->unknownTestId()), $this->payload())
            ->assertStatus(404)
            ->assertJson(['success' => false, 'error' => 'TEST_NOT_FOUND']);

        $this->assertFalse(Test::query()->where('user_id', $this->user->id)->exists());
    }

    /**
     * @param Closure(array<string, mixed>): array<string, mixed> $mutate
     * @param array<int|string, string> $errors
     */
    #[DataProvider('invalidPayloads')]
    public function test_update_rejects_invalid_payload(Closure $mutate, array $errors): void
    {
        $test = $this->createOwnTest();
        $this->seedQuestions($test);
        $questionsBefore = $this->storedQuestions($test);

        $this->putJson(route('web.tests.update', $test->id), $mutate($this->payload()))
            ->assertStatus(422)
            ->assertJsonValidationErrors($errors);

        $this->assertSame($test->title, $test->fresh()->title);
        $this->assertSame($questionsBefore, $this->storedQuestions($test));
    }

    /**
     * @return array{title: string, description: string, attempts: int, questions: array<int, array<string, mixed>>}
     */
    private function payload(): array
    {
        return [
            'title' => 'География',
            'description' => 'Проверка базовых знаний',
            'attempts' => 3,
            'questions' => [
                [
                    'type' => QuestionType::Single->value,
                    'text' => 'Столица Франции?',
                    'answers' => [
                        ['text' => 'Лондон', 'is_correct' => false],
                        ['text' => 'Париж', 'is_correct' => true],
                        ['text' => 'Берлин', 'is_correct' => false],
                    ],
                ],
                [
                    'type' => QuestionType::TrueFalse->value,
                    'text' => 'Земля круглая?',
                    'answers' => [
                        ['text' => 'Да', 'is_correct' => true],
                        ['text' => 'Нет', 'is_correct' => false],
                    ],
                ],
            ],
        ];
    }

    /**
     * @param array<string, mixed> $attributes
     */
    private function createOwnTest(array $attributes = []): Test
    {
        return Test::factory()->create($attributes + [
            'user_id' => $this->user->id,
            'attempts' => 1,
            'is_public' => false,
        ]);
    }

    private function createForeignTest(): Test
    {
        return Test::factory()->create([
            'user_id' => User::factory(),
            'attempts' => 1,
        ]);
    }

    private function unknownTestId(): int
    {
        return (int) Test::query()->max('id') + 1000;
    }

    /**
     * Вопросы создаются в обратном порядке позиций, а ответы — в обратном порядке вставки,
     * чтобы порядок в ответе API определялся именно позициями, а не идентификаторами.
     *
     * @return array{TestQuestion, TestQuestion}
     */
    private function seedQuestions(Test $test): array
    {
        $earth = $this->createQuestion($test, QuestionType::TrueFalse, 'Земля круглая?', 1, [
            ['text' => 'Да', 'is_correct' => true],
            ['text' => 'Нет', 'is_correct' => false],
        ]);

        $capital = $this->createQuestion($test, QuestionType::Single, 'Столица Франции?', 0, [
            ['text' => 'Лондон', 'is_correct' => false],
            ['text' => 'Париж', 'is_correct' => true],
            ['text' => 'Берлин', 'is_correct' => false],
        ]);

        return [$capital, $earth];
    }

    /**
     * @param array<int, array{text: string, is_correct: bool}> $answers
     */
    private function createQuestion(Test $test, QuestionType $type, string $text, int $position, array $answers): TestQuestion
    {
        $question = TestQuestion::factory()->for($test)->create([
            'type' => $type,
            'text' => $text,
            'position' => $position,
        ]);

        foreach (array_reverse($answers, true) as $answerPosition => $answer) {
            $model = TestAnswer::factory()->create([
                'test_id' => $test->id,
                'text' => $answer['text'],
            ]);

            $question->answers()->attach($model->id, [
                'is_correct' => $answer['is_correct'],
                'position' => $answerPosition,
            ]);
        }

        return $question->load('answers');
    }

    /**
     * Состав теста из базы в формате запроса на сохранение — без идентификаторов.
     *
     * @return array<int, array{type: string, text: string, answers: array<int, array{text: string, is_correct: bool}>}>
     */
    private function storedQuestions(Test $test): array
    {
        return $test->questions()
            ->with('answers')
            ->get()
            ->map(static fn (TestQuestion $question): array => [
                'type' => $question->type->value,
                'text' => $question->text,
                'answers' => $question->answers
                    ->map(static fn (TestAnswer $answer): array => [
                        'text' => $answer->text,
                        'is_correct' => (bool) $answer->pivot->is_correct,
                    ])
                    ->all(),
            ])
            ->all();
    }

    /**
     * @param array<int, array<string, mixed>> $questions
     * @return array<int, array<string, mixed>>
     */
    private function withoutIds(array $questions): array
    {
        return array_map(static function (array $question): array {
            unset($question['id']);
            $question['answers'] = array_map(
                static fn (array $answer): array => self::without($answer, 'id'),
                $question['answers']
            );

            return $question;
        }, $questions);
    }

    /**
     * @return array<string, mixed>
     */
    private function listItem(Test $test, int $countFinished): array
    {
        return [
            'id' => $test->id,
            'link' => url("/tests/{$test->link}"),
            'title' => $test->title,
            'description' => $test->description,
            'is_public' => (bool) $test->is_public,
            'attempts' => $test->attempts,
            'count_finished' => $countFinished,
        ];
    }

    /**
     * @param array<string, mixed> $values
     * @return array<string, mixed>
     */
    private static function without(array $values, string $key): array
    {
        unset($values[$key]);

        return $values;
    }
}
