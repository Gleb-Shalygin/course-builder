import { makeTestQuestion } from '@/test/helpers/makeTestQuestion';
import type { TestPayload } from '@/types/tests/Test';

export function makeTestPayload(overrides: Partial<TestPayload> = {}): TestPayload {
    return {
        title: 'Арифметика',
        description: null,
        attempts: 1,
        questions: [makeTestQuestion()],
        ...overrides,
    };
}
