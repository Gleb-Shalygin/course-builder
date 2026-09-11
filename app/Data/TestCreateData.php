<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;

class TestCreateData extends Data
{
    public function __construct(
        public string $title,
        public int $attempts,
        /** @var array<int, TestQuestionData> */
        #[DataCollectionOf(TestQuestionData::class)]
        public array $questions,
        public ?string $description = null,
    ) {}
}
