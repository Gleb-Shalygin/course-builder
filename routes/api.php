<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Profile\TestController;
use Illuminate\Support\Facades\Route;


Route::middleware('web')->name('web.')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::post('/tokens/create', function (Request $request) {
        $token = $request->user()->createToken($request->token_name);

        return ['token' => $token->plainTextToken];
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);

        Route::prefix('tests')->group(function () {
            Route::get('/', [TestController::class, 'tests'])->name('tests');
            Route::post('create', [TestController::class, 'create'])->name('create');
        });
    });
});

