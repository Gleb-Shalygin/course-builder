<?php

namespace App\Service;

use App\Models\Test\Test;

class TestService
{
    public static function tests(): array
    {
        $user = auth()->user();
        $tests = Test::query()
            ->where('user_id', $user->id)
            ->withCount(['testAttempt as count_finished' => function ($query) {
                $query->whereNotNull('finished_at');
            }])
            ->get(['id', 'title', 'description', 'is_public']);

        return $tests->map(fn ($test) => [
            'id' => $test->id,
            'title' => $test->title,
            'description' => $test->description,
            'is_public' => $test->is_public,
            'count_finished' => $test->count_finished
        ])->toArray();
    }
}
