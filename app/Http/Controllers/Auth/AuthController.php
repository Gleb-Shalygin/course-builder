<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Авторизация пользователя
     */
    public function login(Request $request)
    {
        if (Auth::attempt($request->validated())) {
            $request->session()->regenerate();

            return response()->json([
                'user' => Auth::user(),
            ]);
        }

        return response()->json([
            'message' => 'Invalid credentials',
        ], 401);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out'
        ], 200);
    }

    /**
     * Регистрация пользователя
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:users,login'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers(),
            ],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:male,female'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'login' => $request->name, // Используем name как login
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
        ]);

        Auth::login($user);

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Регистрация успешна',
            'user' => $user,
        ], 201);
    }

    /**
     * Выход из системы
     */
//    public function logout(Request $request)
//    {
//        Auth::guard('web')->logout();
//
//        $request->session()->invalidate();
//        $request->session()->regenerateToken();
//
//        return response()->json([
//            'message' => 'Выход выполнен успешно',
//        ]);
//    }
}

