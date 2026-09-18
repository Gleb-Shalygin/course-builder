<?php

namespace App\Http\Resources;

use App\Data\Test\TestDetailQuestionData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TestDetailQuestionData
 */
class TestQuestionResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'text' => $this->text,
            'answers' => TestAnswerResource::collection($this->answers),
        ];
    }
}
