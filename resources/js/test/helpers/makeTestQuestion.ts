import { makeAnswerOption } from '@/test/helpers/makeAnswerOption';
import { QuestionType } from '@/types/tests/Test';
import type { TestQuestion } from '@/types/tests/Test';

export function makeTestQuestion(overrides: Partial<TestQuestion> = {}): TestQuestion {
    return {
        id: 'question-1',
        persistedId: null,
        type: QuestionType.Single,
        text: 'Сколько будет 2 + 2?',
        answers: [
            makeAnswerOption({ id: 'answer-1', text: '4', isCorrect: true }),
            makeAnswerOption({ id: 'answer-2', text: '5' }),
        ],
        isSaved: false,
        ...overrides,
    };
}
