<?php

namespace Database\Seeders;

use App\Models\Test\Test;
use App\Models\Test\TestAttempt;
use Illuminate\Database\Seeder;
use Random\RandomException;

class TestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * @throws RandomException
     */
    public function run(): void
    {
        Test::factory()
            ->count(10)
            ->afterCreating(function (Test $test) {
                $attemptsCount = random_int(1, 5);

                TestAttempt::factory()
                    ->count($attemptsCount)
                    ->for($test)
                    ->sequence(fn() => [
                        'finished_at' => rand(0, 1) ? now() : null, // 50% тестов завершены
                    ])
                    ->create();
            })
            ->create();
    }
}
