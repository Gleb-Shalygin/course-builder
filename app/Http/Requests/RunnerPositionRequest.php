<?php

namespace App\Http\Requests;

use App\Enums\RunnerStage;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class RunnerPositionRequest extends RunnerSessionRequest
{
    /**
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'stage' => ['required', Rule::enum(RunnerStage::class)],
            'question_id' => 'required|integer',
        ]);
    }
}
