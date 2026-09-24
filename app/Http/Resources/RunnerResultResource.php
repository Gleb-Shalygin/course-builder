<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RunnerResultResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'items' => $this['items'],
            'correctCount' => $this['correctCount'],
            'totalCount' => $this['totalCount'],
            'percent' => $this['percent'],
            'title' => $this['title'],
            'status' => $this['status'],
        ];
    }
}
