import { makeRunnerQuestion } from '@/test/helpers/makeRunnerQuestion';
import { RunnerStage } from '@/types/runner/TestRunner';
import type { RunnerState } from '@/types/runner/TestRunner';

export function makeRunnerState(overrides: Partial<RunnerState> = {}): RunnerState {
    return {
        stage: RunnerStage.Question,
        test: {
            id: '1',
            title: 'Арифметика',
            description: null,
            questionsCount: 3,
        },
        questions: [
            makeRunnerQuestion({ id: '1' }),
            makeRunnerQuestion({ id: '2', answers: [{ id: '21', text: '6' }, { id: '22', text: '7' }] }),
            makeRunnerQuestion({ id: '3', answers: [{ id: '31', text: '8' }, { id: '32', text: '9' }] }),
        ],
        answers: {},
        currentQuestionId: '1',
        participant: {
            firstName: 'Иван',
            lastName: 'Петров',
        },
        result: null,
        ...overrides,
    };
}
