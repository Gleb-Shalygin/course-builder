<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Inertia\Response;
use Inertia\ResponseFactory;

class ProfileController extends Controller
{
    public static function index(): Response|ResponseFactory
    {
        return inertia("profile/ProfilePage");
    }
}

