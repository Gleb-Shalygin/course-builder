<?php

namespace Database\Factories\Test;

use App\Models\Test\Test;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Model;
use Random\RandomException;

/**
 * @extends Factory<Test>
 */
class TestFactory extends Factory
{
    /**
     * Название модели, соответствующей фабрике.
     *
     * @var class-string<Model>
     */
    protected $model = Test::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     * @throws RandomException
     */
    public function definition(): array
    {
        return [
            'user_id' => User::query()->where('name', 'gleb_shalygin')->first()->id,
            'title' => fake()->title(),
            'description' => fake()->text(),
            'is_public' => random_int(0, 1)
        ];
    }
}
