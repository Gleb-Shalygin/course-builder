<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\Profile\ProfileController;
use Illuminate\Support\Facades\Route;

//Route::get('/', [HomeController::class, 'index'])->name('home');
//
//Route::prefix('profile')->group(function () {
//    Route::get('/', [ProfileController::class, 'index']);
//})->name('profile.');
Route::get('{any?}', function () {
    return view('app');
})->where('any', '.*');

//Route::get('login',)

