import { QuestionType } from '@/types/Test';
import type { TestPayload, TestQuestion, ValidationResult } from '@/types/Test';

const MIN_ANSWERS = 2;
const MIN_ATTEMPTS = 1;

function filledAnswers(question: TestQuestion) {
    return question.answers.filter((answer) => answer.text.trim() !== '');
}

export function useValidation() {
    function validateQuestion(question: TestQuestion): ValidationResult {
        if (question.text.trim() === '') {
            return { valid: false, message: 'Введите текст вопроса.' };
        }

        const answers = filledAnswers(question);
        const isNotEnoughAnswers = question.type === QuestionType.Single && answers.length < MIN_ANSWERS;

        if (isNotEnoughAnswers) {
            return { valid: false, message: `Заполните минимум ${MIN_ANSWERS} варианта ответа.` };
        }

        if (!answers.some((answer) => answer.isCorrect)) {
            return { valid: false, message: 'Отметьте правильный вариант ответа.' };
        }

        return { valid: true };
    }
    function validateTest(payload: TestPayload): ValidationResult {
        if (payload.title.trim() === '') {
            return { valid: false, message: 'Введите название теста.' };
        }

        if (payload.questions.length === 0) {
            return { valid: false, message: 'Добавьте минимум один вопрос в тест.' };
        }

        if (payload.attempts < MIN_ATTEMPTS) {
            return { valid: false, message: `Количество попыток не может быть меньше ${MIN_ATTEMPTS}.` };
        }

        const invalidQuestion = payload.questions
            .map((question) => validateQuestion(question))
            .find((result) => !result.valid);

        return invalidQuestion ?? { valid: true };
    }

    return {
        validateQuestion,
        validateTest,
    };
}
