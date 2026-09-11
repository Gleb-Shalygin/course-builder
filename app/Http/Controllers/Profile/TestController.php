<?php

namespace App\Http\Controllers\Profile;

use App\Data\TestCreateData;
use App\Exceptions\TestNotCreatedException;
use App\Http\Controllers\Controller;
use App\Http\Requests\TestCreateRequest;
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
     * @throws TestNotCreatedException
     */
    public static function create(TestCreateRequest $request): TestResource
    {
        $data = TestCreateData::from([
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'attempts' => $request->validated('attempts'),
            'questions' => $request->validated('questions'),
        ]);

        return TestResource::make(TestService::create($data));
    }
}
