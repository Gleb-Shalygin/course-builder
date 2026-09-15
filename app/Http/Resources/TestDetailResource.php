<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestDetailResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'],
            'link' => $this['link'],
            'title' => $this['title'],
            'description' => $this['description'],
            'attempts' => $this['attempts'],
            'is_public' => $this['is_public'],
            'questions' => $this['questions'],
        ];
    }
}
