<?php

namespace App\Data\Runner;

use Spatie\LaravelData\Data;


class RunnerSessionData extends Data
{
    public function __construct(
        public string $link,
        public string $sessionKey,
    ) {}
}
