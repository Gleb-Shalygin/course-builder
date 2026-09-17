import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { useQuestionFactory } from '@/composables/tests/builder/useQuestionFactory';
import type { TestPayload, TestQuestion } from '@/types/tests/Test';

const DEFAULT_ATTEMPTS = 1;
const QUESTION_WORDS = ['вопрос', 'вопроса', 'вопросов'];

function questionWord(count: number): string {
    const tens = count % 100;
    const units = count % 10;

    if (tens > 4 && tens < 21) return QUESTION_WORDS[2];
    if (units === 1) return QUESTION_WORDS[0];
    if (units > 1 && units < 5) return QUESTION_WORDS[1];

    return QUESTION_WORDS[2];
}

export function useTestBuilder() {
    const { createQuestion, cloneQuestion } = useQuestionFactory();

    const title = ref('');
    const description: Ref<string | null> = ref(null);
    const attempts = ref(DEFAULT_ATTEMPTS);
    const questions: Ref<TestQuestion[]> = ref([]);
    const editingSnapshot: Ref<TestQuestion | null> = ref(null);

    const savedQuestions = computed((): TestQuestion[] => questions.value.filter((question) => question.isSaved));
    const editingQuestion = computed((): TestQuestion | null => questions.value.find((question) => !question.isSaved) ?? null);
    const isEditing = computed((): boolean => editingQuestion.value !== null);
    const isEmpty = computed((): boolean => questions.value.length === 0);
    const savedCount = computed((): number => savedQuestions.value.length);
    const savedCountLabel = computed((): string => `${savedCount.value} ${questionWord(savedCount.value)}`);

    function addQuestion(): void {
        if (isEditing.value) return;

        editingSnapshot.value = null;
        questions.value.push(createQuestion());
    }
    function editQuestion(questionId: string): void {
        if (isEditing.value) return;

        const question = questions.value.find((item) => item.id === questionId);
        if (!question) return;

        editingSnapshot.value = cloneQuestion(question);
        question.isSaved = false;
    }
    function saveQuestion(question: TestQuestion): void {
        const index = questions.value.findIndex((item) => item.id === question.id);
        if (index === -1) return;

        questions.value[index] = { ...cloneQuestion(question), isSaved: true };
        editingSnapshot.value = null;
    }
    function cancelQuestion(questionId: string): void {
        const snapshot = editingSnapshot.value;

        if (snapshot === null || snapshot.id !== questionId) {
            removeQuestion(questionId);
            return;
        }

        const index = questions.value.findIndex((item) => item.id === questionId);
        if (index !== -1) {
            questions.value[index] = { ...snapshot, isSaved: true };
        }

        editingSnapshot.value = null;
    }
    function removeQuestion(questionId: string): void {
        questions.value = questions.value.filter((item) => item.id !== questionId);

        if (editingSnapshot.value?.id === questionId) {
            editingSnapshot.value = null;
        }
    }
    function buildTestPayload(): TestPayload {
        return {
            title: title.value,
            description: description.value,
            attempts: attempts.value,
            questions: savedQuestions.value.map((question) => cloneQuestion(question)),
        };
    }
    function applyTestPayload(payload: TestPayload): void {
        title.value = payload.title;
        description.value = payload.description;
        attempts.value = payload.attempts;
        questions.value = payload.questions.map((question) => ({ ...cloneQuestion(question), isSaved: true }));
        editingSnapshot.value = null;
    }

    return {
        title,
        description,
        attempts,
        savedQuestions,
        editingQuestion,
        isEditing,
        isEmpty,
        savedCount,
        savedCountLabel,
        addQuestion,
        editQuestion,
        saveQuestion,
        cancelQuestion,
        removeQuestion,
        buildTestPayload,
        applyTestPayload,
    };
}
