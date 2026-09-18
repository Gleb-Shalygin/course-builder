<?php

namespace App\Data\Test;

use App\Enums\QuestionType;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;

class TestDetailQuestionData extends Data
{
    public function __construct(
        public int $id,
        public QuestionType $type,
        public string $text,
        /** @var array<int, TestDetailAnswerData> */
        #[DataCollectionOf(TestDetailAnswerData::class)]
        public array $answers,
    ) {}
}
