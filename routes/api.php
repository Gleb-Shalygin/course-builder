<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Profile\TestController;
use Illuminate\Support\Facades\Route;


Route::middleware('web')->name('web.')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::prefix('tests')->name('tests.')->group(function () {
            Route::get('/', [TestController::class, 'tests'])->name('index');
            Route::post('/', [TestController::class, 'create'])->name('create');
            Route::get('/{test}', [TestController::class, 'test'])->whereNumber('test')->name('show');
            Route::put('/{test}', [TestController::class, 'update'])->whereNumber('test')->name('update');
        });
    });
});

