<?php

namespace App\Data\Runner;

use Spatie\LaravelData\Data;

class RunnerStartData extends Data
{
    public function __construct(
        public string $link,
        public string $sessionKey,
        public string $firstName,
        public string $lastName,
    ) {}
}
