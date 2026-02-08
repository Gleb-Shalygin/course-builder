<?php

namespace App\Service;

use App\Data\UserAuthData;
use App\Exceptions\InvalidCredentialsException;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    /**
     * @param UserAuthData $data
     * @return User
     */
    public static function register(UserAuthData $data): User
    {
        $user = User::query()
            ->create([
                'name' => $data->name,
                'email' => $data->email,
                'gender' => $data->gender,
                'password' => bcrypt($data->password),
                'date_of_birth' => $data->date_of_birth
            ]);

        Auth::login($user);

        return $user;
    }

    /**
     * @throws InvalidCredentialsException
     */
    public static function login(UserAuthData $data): User
    {
        $credentials = array_filter($data->toArray(), static fn ($value) => !is_null($value));

        if (!Auth::attempt($credentials)) {
            throw new InvalidCredentialsException('Invalid credentials');
        }

        return Auth::user();
    }
}
