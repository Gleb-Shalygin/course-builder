<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public static function index(): Response
    {
        return Inertia::render('profile/ProfilePage', [
            'title' => 'Профиль',
        ]);
    }

    public static function tests(): Response
    {
        return Inertia::render('profile/ProfileTestsPage', [
            'title' => 'Тесты',
        ]);
    }
}
