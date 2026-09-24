<?php

namespace Database\Factories\Test;

use App\Models\Test\Test;
use App\Models\Test\TestAnswer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TestAnswer>
 */
class TestAnswerFactory extends Factory
{
    protected $model = TestAnswer::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'test_id' => Test::factory(),
            'text' => fake()->unique()->sentence(3),
        ];
    }
}
