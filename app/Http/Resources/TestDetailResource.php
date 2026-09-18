<?php

namespace App\Http\Resources;

use App\Data\Test\TestDetailData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TestDetailData
 */
class TestDetailResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'link' => $this->link,
            'title' => $this->title,
            'description' => $this->description,
            'attempts' => $this->attempts,
            'is_public' => $this->isPublic,
            'questions' => TestQuestionResource::collection($this->questions),
        ];
    }
}
