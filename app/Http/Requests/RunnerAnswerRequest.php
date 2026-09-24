<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;

class RunnerAnswerRequest extends RunnerSessionRequest
{
    /**
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'question_id' => 'required|integer',
            'answer_id' => 'required|integer',
        ]);
    }
}
