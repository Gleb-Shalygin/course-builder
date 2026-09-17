<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class TestPageController extends Controller
{
    public static function create(): Response
    {
        return Inertia::render('tests/TestCreatePage', [
            'title' => 'Создание теста',
        ]);
    }

    public static function edit(int $test): Response
    {
        return Inertia::render('tests/TestEditPage', [
            'title' => 'Редактирование теста',
            'testId' => $test,
        ]);
    }
}
