<?php

namespace Tests\Feature;

use App\Models\Test\Test;
use Database\Seeders\TestSeeder;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class ProfileTestListTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    public function test_list(): void
    {
        $this->seed(TestSeeder::class);

        $user = Auth::user();

        $tests = Test::query()->where('user_id', $user->id)
            ->withCount(['testAttempt as count_finished' => function ($query) {
                $query->whereNotNull('finished_at');
            }])
            ->orderByDesc('id')
            ->get(['id', 'link', 'title', 'description', 'is_public']);

        $testFakeResponse = ['data' => []];

        foreach ($tests as $test) {
            $testFakeResponse['data'][] = [
                'id' => $test->id,
                'link' => $test->link === null ? null : url("/tests/{$test->link}"),
                'title' => $test->title,
                'description' => $test->description,
                'is_public' => $test->is_public,
                'questions_count' => null,
                'count_finished' => $test->count_finished,
            ];
        }

        $response = $this->getJson(route('web.tests.index'));

        $response->assertExactJson($testFakeResponse);
        $response->assertStatus(200);
    }
}
