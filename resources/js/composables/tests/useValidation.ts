import type { TestPayload, TestQuestion } from '@/types/Test';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

export const useValidation = () => {
    const validateEmail = (email: string): ValidationResult => {
        if (!email || !email.trim()) {
            return { valid: false, message: 'Email обязателен для заполнения.' };
        }

        if (!EMAIL_REGEX.test(email)) {
            return { valid: false, message: 'Введите корректный email.' };
        }

        return { valid: true };
    };

    const validateQuestion = (question: TestQuestion, requireCorrectAnswers: boolean): ValidationResult => {
        if (!question.text || !question.text.trim()) {
            return { valid: false, message: 'Текст вопроса обязателен.' };
        }

        // Для открытого вопроса достаточно текста вопроса (и опционального правильного ответа)
        if (question.type === 'open') {
            if (requireCorrectAnswers && (!question.correctText || !question.correctText.trim())) {
                return {
                    valid: false,
                    message: 'Для индивидуальной проверки необходимо указать правильный ответ.',
                };
            }
            return { valid: true };
        }

        if (!question.answers || question.answers.length === 0) {
            return { valid: false, message: 'Добавьте хотя бы один вариант ответа.' };
        }

        if (requireCorrectAnswers) {
            const hasCorrect = question.answers.some((answer) => answer.isCorrect);
            if (!hasCorrect) {
                return {
                    valid: false,
                    message: 'Для индивидуальной проверки необходимо отметить правильные ответы.',
                };
            }
        }

        return { valid: true };
    };

    const validateTestBeforeSave = (payload: TestPayload): ValidationResult => {
        const emailResult = validateEmail(payload.settings.email);
        if (!emailResult.valid) {
            return emailResult;
        }

        if (!payload.questions || payload.questions.length === 0) {
            return { valid: false, message: 'Добавьте минимум один вопрос в тест.' };
        }

        if (payload.settings.individualChecking) {
            for (const question of payload.questions) {
                const result = validateQuestion(question, true);
                if (!result.valid) {
                    return result;
                }
            }
        }

        if (!payload.settings.attempts || payload.settings.attempts < 1) {
            return { valid: false, message: 'Количество попыток не может быть меньше 1.' };
        }

        return { valid: true };
    };

    return {
        validateEmail,
        validateQuestion,
        validateTestBeforeSave,
    };
};

