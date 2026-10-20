import type { RunnerResult } from '@/types/runner/TestRunner';

export function makeRunnerResult(overrides: Partial<RunnerResult> = {}): RunnerResult {
    return {
        items: [],
        correctCount: 2,
        totalCount: 3,
        percent: 67,
        title: 'Хороший результат',
        status: 'normal',
        ...overrides,
    };
}
