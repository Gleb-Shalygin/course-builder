<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class RunnerStateResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'stage' => $this['stage'],
            'test' => $this['test'],
            'questions' => $this['questions'],
            'answers' => (object) $this['answers'],
            'currentQuestionId' => $this['currentQuestionId'],
            'participant' => $this['participant'],
            'result' => $this['result'],
        ];
    }
}
