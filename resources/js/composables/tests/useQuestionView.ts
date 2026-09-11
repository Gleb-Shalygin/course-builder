import { computed } from 'vue';
import type { Ref } from 'vue';
import { QuestionType } from '@/types/Test';
import type { AnswerOption, TestQuestion } from '@/types/Test';

export function useQuestionView(question: Ref<TestQuestion>) {
    const typeLabel = computed((): string => (question.value.type === QuestionType.TrueFalse ? 'Да / Нет' : 'Одиночный выбор'));
    const visibleAnswers = computed((): AnswerOption[] => question.value.answers.filter((answer) => answer.text.trim() !== ''));
    const questionText = computed((): string => question.value.text);
    const isAnswersVisible = computed((): boolean => visibleAnswers.value.length > 0);

    function isCorrectAnswer(answer: AnswerOption): boolean {
        return answer.isCorrect;
    }

    return {
        typeLabel,
        questionText,
        visibleAnswers,
        isAnswersVisible,
        isCorrectAnswer,
    };
}
