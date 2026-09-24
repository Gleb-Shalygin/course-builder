<?php

namespace App\Data\Runner;

use Spatie\LaravelData\Data;

class RunnerAnswerData extends Data
{
    public function __construct(
        public string $link,
        public string $sessionKey,
        public int $questionId,
        public int $answerId,
    ) {}
}
