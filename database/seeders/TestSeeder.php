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
            ->has(TestAttempt::factory()->count(random_int(1,5)))
            ->count(10)
            ->create();
    }
}
