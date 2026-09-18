<?php

namespace App\Data\Test;

use Spatie\LaravelData\Data;

class TestDetailAnswerData extends Data
{
    public function __construct(
        public int $id,
        public string $text,
        public bool $isCorrect,
    ) {}
}
