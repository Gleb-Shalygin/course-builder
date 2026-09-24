import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useQuestionFactory } from '@/composables/tests/builder/useQuestionFactory';
import { useValidation } from '@/composables/tests/builder/useValidation';
import { QuestionType } from '@/types/tests/Test';
import type { AnswerOption, QuestionTypeOption, TestQuestion } from '@/types/tests/Test';

const TYPE_OPTIONS: QuestionTypeOption[] = [
    { value: QuestionType.Single, label: 'Одиночный выбор' },
    { value: QuestionType.TrueFalse, label: 'Да / Нет' },
];

export function useQuestionEditor(question: Ref<TestQuestion>) {
    const { createEmptyAnswers, createBooleanAnswers, cloneQuestion } = useQuestionFactory();
    const { validateQuestion } = useValidation();

    const draft: Ref<TestQuestion> = ref(cloneQuestion(question.value));
    const errorMessage = ref('');

    const typeOptions = computed((): QuestionTypeOption[] => TYPE_OPTIONS);
    const isAnswersEditable = computed((): boolean => draft.value.type === QuestionType.Single);
    const isError = computed((): boolean => errorMessage.value !== '');
    const answersHint = computed((): string => isAnswersEditable.value
        ? 'Отметьте правильный вариант ответа'
        : 'Выберите, какой ответ считается правильным');

    watch(() => question.value.id, () => {
        draft.value = cloneQuestion(question.value);
        errorMessage.value = '';
    });

    function setType(value: string | number): void {
        const type = String(value) === QuestionType.TrueFalse ? QuestionType.TrueFalse : QuestionType.Single;

        if (type === draft.value.type) return;

        draft.value.type = type;
        draft.value.answers = type === QuestionType.TrueFalse ? createBooleanAnswers() : createEmptyAnswers();
        errorMessage.value = '';
    }
    function setAnswers(answers: AnswerOption[]): void {
        draft.value.answers = answers;
    }
    function validate(): boolean {
        const result = validateQuestion(draft.value);
        errorMessage.value = result.valid ? '' : result.message ?? 'Проверьте заполнение вопроса.';

        return result.valid;
    }

    return {
        draft,
        errorMessage,
        typeOptions,
        isAnswersEditable,
        isError,
        answersHint,
        setType,
        setAnswers,
        validate,
    };
}
