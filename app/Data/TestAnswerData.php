<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;

class TestAnswerData extends Data
{
    public function __construct(
        public string $text,
        #[MapInputName('is_correct')]
        public bool $isCorrect,
    ) {}
}
