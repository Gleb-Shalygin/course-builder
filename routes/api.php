<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Profile\TestController;
use App\Http\Controllers\Runner\RunnerController;
use Illuminate\Support\Facades\Route;


Route::middleware('web')->name('web.')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::prefix('runner/{link}')
        ->whereUuid('link')
        ->name('runner.')
        ->group(function () {
            Route::get('/state', [RunnerController::class, 'state'])->name('state');
            Route::post('/start', [RunnerController::class, 'start'])->name('start');
            Route::post('/answer', [RunnerController::class, 'answer'])->name('answer');
            Route::patch('/position', [RunnerController::class, 'position'])->name('position');
            Route::post('/finish', [RunnerController::class, 'finish'])->name('finish');
        });

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

