<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;


class RunnerSessionRequest extends FormRequest
{
    public const SESSION_HEADER = 'X-Runner-Session';

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'session_key' => 'required|string|uuid',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'session_key' => $this->header(self::SESSION_HEADER),
        ]);
    }
}
