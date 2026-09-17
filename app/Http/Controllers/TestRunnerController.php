<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class TestRunnerController extends Controller
{
    public static function show(string $link): Response
    {
        return Inertia::render('tests/TestRunnerPage', [
            'link' => $link,
        ]);
    }
}
