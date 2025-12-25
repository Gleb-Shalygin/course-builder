<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::name('auth.')
    ->prefix('auth')
    ->group(function () {
        Route::group(['middleware' => ['guest']], function () {
            Route::post('login', [AuthController::class, 'login'])->name('login');
        });
//        Route::apiResource('register', RegistrationController::class)->only(['store']);
//        Route::apiResource('forgot-password', ForgotPasswordController::class)->only(['store']);
//        Route::apiResource('reset-password', ResetPasswordController::class)->only(['store']);

        Route::group(['middleware' => ['auth:sanctum']], function () {
            Route::delete('logout', [AuthController::class, 'logout'])->name('logout');
        });
});

