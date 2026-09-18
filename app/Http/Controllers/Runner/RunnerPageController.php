<?php

namespace App\Http\Controllers\Runner;

use App\Http\Controllers\Controller;
use App\Service\RunnerService;
use Inertia\Inertia;
use Inertia\Response;

class RunnerPageController extends Controller
{
    public static function show(string $link): Response
    {
        $intro = RunnerService::intro($link);

        if ($intro === null) {
            abort(404);
        }

        return Inertia::render('tests/TestRunnerPage', ['intro' => $intro]);
    }
}
