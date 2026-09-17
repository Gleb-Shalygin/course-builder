<?php

namespace App\Data;

use Spatie\LaravelData\Data;


class RunnerSessionData extends Data
{
    public function __construct(
        public string $link,
        public string $sessionKey,
    ) {}
}
