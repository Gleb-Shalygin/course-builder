<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestsResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this['id'],
            'title' => $this['title'],
            'description' => $this['description'],
            'is_public' => $this['is_public']
        ];
    }
}
