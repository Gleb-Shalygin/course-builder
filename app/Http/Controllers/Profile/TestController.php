<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
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
}
