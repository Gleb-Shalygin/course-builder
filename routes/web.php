<?php

use App\Http\Controllers\Auth\AuthPageController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\Profile\TestPageController;
use App\Http\Controllers\Runner\RunnerPageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/tests/{link}', [RunnerPageController::class, 'show'])
    ->whereUuid('link')
    ->name('tests.run');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthPageController::class, 'login'])->name('login');
    Route::get('/register', [AuthPageController::class, 'register'])->name('register');
});

Route::middleware('auth')->prefix('profile')->name('profile.')->group(function (): void {
    Route::get('/', [ProfileController::class, 'index'])->name('index');
    Route::get('/tests', [ProfileController::class, 'tests'])->name('tests');
    Route::get('/test-create', [TestPageController::class, 'create'])->name('test-create');
    Route::get('/tests/{test}/edit', [TestPageController::class, 'edit'])
        ->whereNumber('test')
        ->name('test-edit');
});
