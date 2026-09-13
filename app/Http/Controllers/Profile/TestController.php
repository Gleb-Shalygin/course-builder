<?php

namespace App\Http\Controllers\Profile;

use App\Data\TestSaveData;
use App\Exceptions\TestNotCreatedException;
use App\Exceptions\TestNotFoundException;
use App\Exceptions\TestNotUpdatedException;
use App\Http\Controllers\Controller;
use App\Http\Requests\TestSaveRequest;
use App\Http\Resources\TestDetailResource;
use App\Http\Resources\TestResource;
use App\Http\Resources\TestsResource;
use App\Service\TestService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Collection;

class TestController extends Controller
{
    public static function tests(): AnonymousResourceCollection|Collection
    {
       return TestsResource::collection(TestService::tests());
    }

    /**
     * @throws TestNotFoundException
     */
    public static function test(int $test): TestDetailResource
    {
        return TestDetailResource::make(TestService::test($test));
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

        return TestResource::make(TestService::create($data));
    }

    /**
     * @throws TestNotFoundException
     * @throws TestNotUpdatedException
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

        return TestResource::make(TestService::update($data));
    }
}
