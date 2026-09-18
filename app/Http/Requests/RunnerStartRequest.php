<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;

class RunnerStartRequest extends RunnerSessionRequest
{
    /**
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
        ]);
    }
}
