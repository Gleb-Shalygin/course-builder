<?php

namespace App\Http\Controllers\Auth;

use App\Data\UserAuthData;
use App\Exceptions\InvalidCredentialsException;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserLoginRequest;
use App\Http\Requests\UserRegisterRequest;
use App\Http\Resources\UserResource;
use App\Service\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public static function register(UserRegisterRequest $request): JsonResponse
    {
        $data = UserAuthData::from([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'password_confirmation' => $request->validated('password_confirmation'),
            'gender' => $request->validated('gender'),
            'date_of_birth' => $request->validated('date_of_birth'),
        ]);

        return response()->json(UserResource::make(AuthService::register($data)));
    }

    /**
     * @throws InvalidCredentialsException
     */
    public static function login(UserLoginRequest $request): JsonResponse
    {
        $data = UserAuthData::from([
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
        ]);

        $user = AuthService::login($data);

        $request->session()->regenerate();

        return response()->json(UserResource::make($user));
    }
    public static function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout(); // guard = web
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Вы вышли из аккаунта']);
    }

    public static function user(Request $request): JsonResponse
    {
        return response()->json(UserResource::make($request->user()));
    }
}

