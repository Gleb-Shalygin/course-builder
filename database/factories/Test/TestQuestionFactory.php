<?php

namespace Database\Factories\Test;

use App\Enums\QuestionType;
use App\Models\Test\Test;
use App\Models\Test\TestAnswer;
use App\Models\Test\TestQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TestQuestion>
 */
class TestQuestionFactory extends Factory
{
    protected $model = TestQuestion::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'test_id' => Test::factory(),
            'type' => QuestionType::Single,
            'text' => fake()->sentence(),
            'position' => 0,
        ];
    }

    /**
     * Варианты ответа того же теста; верный — первый по позиции.
     */
    public function withAnswers(int $count = 2): static
    {
        return $this->afterCreating(static function (TestQuestion $question) use ($count): void {
            $answers = TestAnswer::factory()
                ->count($count)
                ->create(['test_id' => $question->test_id]);

            $question->answers()->attach(
                $answers->values()->mapWithKeys(static fn (TestAnswer $answer, int $index): array => [
                    $answer->id => ['is_correct' => $index === 0, 'position' => $index],
                ])->all()
            );
        });
    }
}
