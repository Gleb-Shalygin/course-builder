<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class HomeController extends Controller
{
    public static function index(): \Inertia\Response
    {
        return Inertia::render('Welcome');
    }
}
