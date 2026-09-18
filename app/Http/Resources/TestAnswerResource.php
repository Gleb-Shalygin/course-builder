<?php

namespace App\Http\Resources;

use App\Data\Test\TestDetailAnswerData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TestDetailAnswerData
 */
class TestAnswerResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'text' => $this->text,
            'is_correct' => $this->isCorrect,
        ];
    }
}
