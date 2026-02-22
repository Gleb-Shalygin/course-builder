import { ref } from 'vue';
import type { Ref } from 'vue';
import { QuestionType, type TestPayload, type TestQuestion, type TestSettings } from '@/types/Test';

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createDefaultSettings = (): TestSettings => ({
    accessType: 'private',
    email: '',
    sendResultsToEmail: false,
    teacherReviewed: false,
    individualChecking: false,
    attempts: 1,
});

const createEmptyQuestion = (): TestQuestion => ({
    id: createId(),
    type: QuestionType.Single,
    text: '',
    answers: [],
    imageFile: null,
    imageUrl: undefined,
    correctText: undefined,
    isDraftSaved: false,
});

export const useTestBuilder = () => {
    const settings: Ref<TestSettings> = ref(createDefaultSettings());
    const questions: Ref<TestQuestion[]> = ref([]);

    const addQuestion = () => {
        questions.value.push(createEmptyQuestion());
    };

    const updateQuestion = (updated: TestQuestion) => {
        const index = questions.value.findIndex((q) => q.id === updated.id);
        if (index !== -1) {
            questions.value[index] = { ...questions.value[index], ...updated };
        }
    };

    const removeQuestion = (questionId: string) => {
        questions.value = questions.value.filter((q) => q.id !== questionId);
    };

    const reset = () => {
        settings.value = createDefaultSettings();
        questions.value = [];
    };

    const buildTestPayload = (): TestPayload => ({
        settings: { ...settings.value },
        questions: questions.value.map((q) => ({
            ...q,
            // Лишние клиентские поля можно отфильтровать здесь
        })),
    });

    return {
        settings,
        questions,
        addQuestion,
        updateQuestion,
        removeQuestion,
        reset,
        buildTestPayload,
    };
};

