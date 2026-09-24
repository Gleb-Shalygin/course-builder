<?php

namespace App\Data\Test;

use Spatie\LaravelData\Data;

/**
 * Тест без вопросов — для списка и для ответа на сохранение.
 * Счётчик попыток известен только в списке, поэтому необязательный.
 */
class TestData extends Data
{
    public function __construct(
        public int $id,
        public ?string $link,
        public string $title,
        public ?string $description,
        public bool $isPublic,
        public int $attempts,
        public ?int $countFinished = null,
    ) {}
}
