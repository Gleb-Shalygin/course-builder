<?php

namespace App\Data\Test;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;

/**
 * Данные сохранения теста — общие для создания и редактирования.
 * При создании теста идентификатора ещё нет, поэтому он необязательный.
 */
class TestSaveData extends Data
{
    public function __construct(
        public string $title,
        public int $attempts,
        /** @var array<int, TestQuestionData> */
        #[DataCollectionOf(TestQuestionData::class)]
        public array $questions,
        public ?string $description = null,
        public ?int $id = null,
    ) {}
}
