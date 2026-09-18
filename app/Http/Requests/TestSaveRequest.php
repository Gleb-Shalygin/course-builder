<?php

namespace App\Http\Requests;

use App\Enums\QuestionType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Правила сохранения теста — общие для создания и редактирования:
 * тест всегда приходит целиком, вместе со всеми вопросами и вариантами ответов.
 */
class TestSaveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'attempts' => 'required|integer|min:1|max:99',
            'questions' => 'required|array|min:1',
            'questions.*.id' => 'nullable|integer',
            'questions.*.type' => ['required', Rule::enum(QuestionType::class)],
            'questions.*.text' => 'required|string|max:500',
            'questions.*.answers' => 'required|array|min:2|max:8',
            'questions.*.answers.*.id' => 'nullable|integer',
            'questions.*.answers.*.text' => 'required|string|max:255',
            'questions.*.answers.*.is_correct' => 'required|boolean',
        ];
    }

    /**
     * Проверки, которые нельзя выразить обычными правилами.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $questions = $this->input('questions');

                if (!is_array($questions)) {
                    return;
                }

                foreach ($questions as $index => $question) {
                    $this->validateQuestionAnswers($validator, $index, $question);
                }
            },
        ];
    }

    private function validateQuestionAnswers(Validator $validator, int|string $index, mixed $question): void
    {
        if (!is_array($question) || !is_array($question['answers'] ?? null)) {
            return;
        }

        $answers = $question['answers'];
        $correctCount = count(array_filter(
            $answers,
            static fn (mixed $answer): bool => is_array($answer) && (bool) ($answer['is_correct'] ?? false)
        ));

        if ($correctCount !== 1) {
            $validator->errors()->add("questions.$index.answers", 'В вопросе должен быть ровно один правильный ответ.');
        }

        $isBooleanQuestion = ($question['type'] ?? null) === QuestionType::TrueFalse->value;

        if ($isBooleanQuestion && count($answers) !== 2) {
            $validator->errors()->add("questions.$index.answers", 'Вопрос «Да / Нет» должен содержать ровно два варианта ответа.');
        }
    }
}
