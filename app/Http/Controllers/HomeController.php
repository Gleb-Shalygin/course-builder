<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public static function index(): Response
    {
        return Inertia::render('Welcome');
    }
}
