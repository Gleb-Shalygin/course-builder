<?php

namespace App\Data\Test;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;

class TestDetailData extends Data
{
    public function __construct(
        public int $id,
        public ?string $link,
        public string $title,
        public ?string $description,
        public int $attempts,
        public bool $isPublic,
        /** @var array<int, TestDetailQuestionData> */
        #[DataCollectionOf(TestDetailQuestionData::class)]
        public array $questions,
    ) {}
}
