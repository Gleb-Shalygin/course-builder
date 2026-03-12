<?php

namespace Database\Factories\Test;

use App\Models\Test\Test;
use App\Models\Test\TestAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Random\RandomException;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class TestAttemptFactory extends Factory
{
    protected $model = TestAttempt::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     * @throws RandomException
     */
    public function definition(): array
    {
        return [
            'test_id' => Test::factory(),
            'user_id' => User::factory(),
            'score' => random_int(1, 30),
            'started_at' => fake()->dateTime,
            'finished_at' => fake()->dateTime,
        ];
    }
}
