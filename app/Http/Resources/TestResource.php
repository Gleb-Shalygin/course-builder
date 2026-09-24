<?php

namespace App\Http\Resources;

use App\Data\Test\TestData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TestData
 */
class TestResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'link' => $this->link,
            'title' => $this->title,
            'description' => $this->description,
            'is_public' => $this->isPublic,
            'attempts' => $this->attempts,
            'count_finished' => $this->countFinished,
        ];
    }
}
