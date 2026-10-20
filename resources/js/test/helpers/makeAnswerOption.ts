import type { AnswerOption } from '@/types/tests/Test';

export function makeAnswerOption(overrides: Partial<AnswerOption> = {}): AnswerOption {
    return {
        id: 'answer-1',
        persistedId: null,
        text: 'Ответ',
        isCorrect: false,
        ...overrides,
    };
}
