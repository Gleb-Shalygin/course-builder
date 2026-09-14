import { computed, ref } from 'vue';

export function useRunnerAnswers() {
    const selectedAnswers = ref<Record<string, string>>({});

    const answeredCount = computed((): number => Object.keys(selectedAnswers.value).length);

    const selectedAnswerId = (questionId: string): string | null => selectedAnswers.value[questionId] ?? null;
    const selectAnswer = (questionId: string, answerId: string): void => {
        selectedAnswers.value = { ...selectedAnswers.value, [questionId]: answerId };
    };
    const resetAnswers = (): void => {
        selectedAnswers.value = {};
    };

    return {
        selectedAnswers,
        answeredCount,
        selectedAnswerId,
        selectAnswer,
        resetAnswers,
    };
}
