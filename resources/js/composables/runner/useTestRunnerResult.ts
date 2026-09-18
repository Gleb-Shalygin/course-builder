import { computed } from 'vue';
import type { Ref } from 'vue';
import type { RunnerResult } from '@/types/runner/TestRunner.ts';

type RestartEmit = (event: 'restart') => void;

export function useTestRunnerResult(result: Ref<RunnerResult>, emit: RestartEmit) {
    const counterLabel = computed((): string => `Правильных ответов: ${result.value.correctCount} из ${result.value.totalCount}`);

    const handleRestart = (): void => {
        emit('restart');
    };

    return {
        counterLabel,
        handleRestart,
    };
}
