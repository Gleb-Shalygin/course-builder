<?php

namespace App\Service\Test;

use App\Data\Test\TestData;
use App\Data\Test\TestDetailData;
use App\Exceptions\TestNotFoundException;
use App\Models\Test\Test;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class TestProviderService
{
    /**
     * @return Collection<int, TestData>
     */
    public static function tests(): Collection
    {
        return Test::query()
            ->where('user_id', auth()->id())
            ->withCount([
                'testAttempt as count_finished' => static fn (Builder $query) => $query->whereNotNull('finished_at'),
            ])
            ->orderByDesc('id')
            ->get(['id', 'link', 'title', 'description', 'is_public', 'attempts'])
            ->map(static fn (Test $test): TestData => TestDataFactory::test($test));
    }

    /**
     * @throws TestNotFoundException
     */
    public static function test(int $testId): TestDetailData
    {
        return TestDataFactory::detail(self::userTest($testId)->load('questions.answers'));
    }

    /**
     * @throws TestNotFoundException
     */
    public static function userTest(?int $testId): Test
    {
        if ($testId === null) {
            throw new TestNotFoundException('Тест не найден');
        }

        $test = Test::query()
            ->where('id', $testId)
            ->where('user_id', auth()->id())
            ->first();

        if ($test === null) {
            throw new TestNotFoundException('Тест не найден');
        }

        return $test;
    }
}
