import { QuestionType } from '@/types/tests/Test';
import type { TestDetail } from '@/types/tests/Test';

export function makeTestDetail(overrides: Partial<TestDetail> = {}): TestDetail {
    return {
        id: 1,
        link: null,
        title: 'Арифметика',
        description: null,
        attempts: 1,
        is_public: false,
        questions: [
            {
                id: 10,
                type: QuestionType.Single,
                text: 'Сколько будет 2 + 2?',
                answers: [
                    { id: 100, text: '4', is_correct: true },
                    { id: 101, text: '5', is_correct: false },
                ],
            },
        ],
        ...overrides,
    };
}
