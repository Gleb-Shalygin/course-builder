<?php

namespace App\Http\Controllers\Profile;

use App\Data\Test\TestSaveData;
use App\Exceptions\TestNotCreatedException;
use App\Exceptions\TestNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\TestSaveRequest;
use App\Http\Resources\TestDetailResource;
use App\Http\Resources\TestResource;
use App\Service\Test\TestProviderService;
use App\Service\Test\TestWriterService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TestController extends Controller
{
    public static function tests(): AnonymousResourceCollection
    {
        return TestResource::collection(TestProviderService::tests());
    }

    /**
     * @throws TestNotFoundException
     */
    public static function test(int $test): TestDetailResource
    {
        return TestDetailResource::make(TestProviderService::test($test));
    }

    /**
     * @throws TestNotCreatedException
     */
    public static function create(TestSaveRequest $request): TestResource
    {
        $data = TestSaveData::from([
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'attempts' => $request->validated('attempts'),
            'questions' => $request->validated('questions'),
        ]);

        return TestResource::make(TestWriterService::create($data));
    }

    /**
     * @throws TestNotFoundException
     */
    public static function update(TestSaveRequest $request, int $test): TestResource
    {
        $data = TestSaveData::from([
            'id' => $test,
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'attempts' => $request->validated('attempts'),
            'questions' => $request->validated('questions'),
        ]);

        return TestResource::make(TestWriterService::update($data));
    }
}
