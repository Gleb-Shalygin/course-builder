<?php

namespace App\Service\Test;

use App\Data\Test\TestData;
use App\Data\Test\TestSaveData;
use App\Exceptions\TestNotCreatedException;
use App\Exceptions\TestNotFoundException;
use App\Models\Test\Test;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TestWriterService
{
    /**
     * @throws TestNotCreatedException
     */
    public static function create(TestSaveData $data): TestData
    {
        $userId = auth()->id();

        if ($userId === null) {
            throw new TestNotCreatedException('Создавать тесты может только авторизованный пользователь');
        }

        return DB::transaction(static function () use ($data, $userId): TestData {
            $test = Test::query()->create([
                'user_id' => $userId,
                'link' => (string) Str::uuid(),
                'title' => $data->title,
                'description' => $data->description,
                'attempts' => $data->attempts,
                'is_public' => false,
            ]);

            TestQuestionsSync::sync($test, $data->questions);

            return TestDataFactory::test($test);
        });
    }

    /**
     * @throws TestNotFoundException
     */
    public static function update(TestSaveData $data): TestData
    {
        $test = TestProviderService::userTest($data->id);

        return DB::transaction(static function () use ($data, $test): TestData {
            $test->update([
                'title' => $data->title,
                'description' => $data->description,
                'attempts' => $data->attempts,
            ]);

            TestQuestionsSync::sync($test, $data->questions);

            return TestDataFactory::test($test);
        });
    }
}
