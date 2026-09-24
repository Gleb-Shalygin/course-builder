<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AuthPageController extends Controller
{
    public static function login(): Response
    {
        return Inertia::render('LoginPage');
    }

    public static function register(): Response
    {
        return Inertia::render('RegisterPage');
    }
}
