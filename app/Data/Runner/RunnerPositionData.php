<?php

namespace App\Data\Runner;

use App\Enums\RunnerStage;
use Spatie\LaravelData\Data;

class RunnerPositionData extends Data
{
    public function __construct(
        public string $link,
        public string $sessionKey,
        public RunnerStage $stage,
        public int $questionId,
    ) {}
}
