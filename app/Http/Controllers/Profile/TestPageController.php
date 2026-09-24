<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Service\Test\TestProviderService;
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
        if (!TestProviderService::userTestExists($test)) {
            abort(404);
        }

        return Inertia::render('tests/TestEditPage', [
            'title' => 'Редактирование теста',
            'testId' => $test,
        ]);
    }
}
