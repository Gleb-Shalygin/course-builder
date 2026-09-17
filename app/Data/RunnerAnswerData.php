<?php

namespace App\Data;

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
