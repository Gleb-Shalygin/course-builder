<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class UserAuthData extends Data
{
    public function __construct(
        public string $email,
        public string $password,
        public ?string $name,
        public ?string $password_confirmation,
        public ?string $gender = null,
        public ?string $date_of_birth = null,
    ) {}
}

