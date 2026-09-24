import { computed } from 'vue';
import type { Ref } from 'vue';
import { useQuestionFactory } from '@/composables/tests/builder/useQuestionFactory';
import type { AnswerOption } from '@/types/tests/Test';

const MIN_ANSWERS = 2;
const MAX_ANSWERS = 8;

export function useAnswersEditor(answers: Ref<AnswerOption[]>, editable: Ref<boolean>) {
    const { createAnswer } = useQuestionFactory();

    const correctAnswerId = computed((): string => answers.value.find((answer) => answer.isCorrect)?.id ?? '');
    const isAddVisible = computed((): boolean => editable.value && answers.value.length < MAX_ANSWERS);
    const isRemoveVisible = computed((): boolean => editable.value && answers.value.length > MIN_ANSWERS);

    function withNewAnswer(): AnswerOption[] {
        return [...answers.value, createAnswer()];
    }
    function withoutAnswer(answerId: string): AnswerOption[] {
        return answers.value.filter((answer) => answer.id !== answerId);
    }
    function withAnswerText(answerId: string, text: string): AnswerOption[] {
        return answers.value.map((answer) => (answer.id === answerId ? { ...answer, text } : answer));
    }
    function withCorrectAnswer(answerId: string): AnswerOption[] {
        return answers.value.map((answer) => ({ ...answer, isCorrect: answer.id === answerId }));
    }

    return {
        correctAnswerId,
        isAddVisible,
        isRemoveVisible,
        withNewAnswer,
        withoutAnswer,
        withAnswerText,
        withCorrectAnswer,
    };
}
