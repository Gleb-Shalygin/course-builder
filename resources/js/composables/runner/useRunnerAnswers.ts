import { computed } from 'vue';
import type { Ref } from 'vue';
import type { RunnerState } from '@/types/runner/TestRunner.ts';

/** Ответы больше не копятся в браузере — читаем их из состояния, пришедшего с бэкенда. */
export function useRunnerAnswers(state: Ref<RunnerState | null>) {
    const answers = computed((): Record<string, string> => state.value?.answers ?? {});
    const answeredCount = computed((): number => Object.keys(answers.value).length);

    const selectedAnswerId = (questionId: string): string | null => answers.value[questionId] ?? null;

    return {
        answers,
        answeredCount,
        selectedAnswerId,
    };
}
