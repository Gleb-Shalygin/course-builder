import { computed } from 'vue';
import type { Ref } from 'vue';
import type { RunnerAnswerOption, RunnerSlide } from '@/types/runner/TestRunner.ts';

export function useRunnerSlide(slide: Ref<RunnerSlide>) {
    const questionNumber = computed((): number => slide.value.number);
    const questionText = computed((): string => slide.value.question.text);
    const answers = computed((): RunnerAnswerOption[] => slide.value.question.answers);
    const selectedAnswerId = computed((): string | null => slide.value.selectedAnswerId);

    const isSelected = (answer: RunnerAnswerOption): boolean => answer.id === selectedAnswerId.value;
    const answerClass = (answer: RunnerAnswerOption): string => (isSelected(answer) ? 'runner-question__answer--active' : '');

    return {
        questionNumber,
        questionText,
        answers,
        selectedAnswerId,
        answerClass,
    };
}
