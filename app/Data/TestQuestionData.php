<?php

namespace App\Data;

use App\Enums\QuestionType;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;

class TestQuestionData extends Data
{
    public function __construct(
        public QuestionType $type,
        public string $text,
        /** @var array<int, TestAnswerData> */
        #[DataCollectionOf(TestAnswerData::class)]
        public array $answers,
        public ?int $id = null,
    ) {}
}
