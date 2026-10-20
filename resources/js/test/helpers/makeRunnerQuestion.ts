import { QuestionType } from '@/types/tests/Test';
import type { RunnerQuestion } from '@/types/runner/TestRunner';

export function makeRunnerQuestion(overrides: Partial<RunnerQuestion> = {}): RunnerQuestion {
    return {
        id: '1',
        type: QuestionType.Single,
        text: 'Сколько будет 2 + 2?',
        answers: [
            { id: '11', text: '4' },
            { id: '12', text: '5' },
        ],
        ...overrides,
    };
}
