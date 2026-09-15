import { computed } from 'vue';
import type { Ref } from 'vue';
import type { RunnerResultItem } from '@/types/TestRunner.ts';

export function useTestRunnerResultItem(item: Ref<RunnerResultItem>) {
    const rootClass = computed((): string => (item.value.isCorrect ? 'runner-answer--correct' : 'runner-answer--wrong'));
    const selectedLabel = computed((): string => item.value.selectedText ?? 'нет ответа');
    const isCorrectVisible = computed((): boolean => !item.value.isCorrect);

    return {
        rootClass,
        selectedLabel,
        isCorrectVisible,
    };
}
