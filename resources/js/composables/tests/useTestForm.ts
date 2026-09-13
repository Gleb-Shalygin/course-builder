import { computed, watch } from 'vue';
import type { Ref } from 'vue';
import { useTestBuilder } from '@/composables/tests/useTestBuilder';
import { useTestLoading } from '@/composables/tests/useTestLoading';
import { useTestSaving } from '@/composables/tests/useTestSaving';
import { useTestsNavigation } from '@/composables/tests/useTestsNavigation';
import type { TestPayload } from '@/types/Test';

export function useTestForm(testId: Ref<number | null>) {
    const { goToTests } = useTestsNavigation();
    const {
        title,
        attempts,
        savedQuestions,
        editingQuestion,
        isEditing,
        isEmpty,
        savedCountLabel,
        addQuestion,
        editQuestion,
        saveQuestion,
        cancelQuestion,
        removeQuestion,
        buildTestPayload,
        applyTestPayload,
    } = useTestBuilder();
    const {
        loadedTest,
        isLoading,
        isError: isLoadError,
        errorMessage: loadErrorMessage,
        loadTest,
    } = useTestLoading(testId);
    const {
        isSaving,
        isSaved,
        isError: isSaveError,
        errorMessage: saveErrorMessage,
        savedTestId,
        saveTest,
    } = useTestSaving(testId);

    const isEdit = computed((): boolean => testId.value !== null);
    const currentTestId = computed((): number | null => testId.value ?? savedTestId.value);
    const listClass = computed((): string => (isEditing.value ? 'test-form__list--locked' : ''));
    const submitLabel = computed((): string => (isEdit.value ? 'Сохранить изменения' : 'Сохранить тест'));
    const isError = computed((): boolean => isLoadError.value || isSaveError.value);
    const errorMessage = computed((): string => (isLoadError.value ? loadErrorMessage.value : saveErrorMessage.value));
    const isSubmitDisabled = computed((): boolean => isLoading.value || isLoadError.value);

    watch(loadedTest, (payload: TestPayload | null): void => {
        if (payload === null) return;

        applyTestPayload(payload);
    });

    function handleTitle(value: string): void {
        title.value = value;
    }
    function handleAttempts(value: number): void {
        attempts.value = value;
    }
    async function handleSaveTest(): Promise<void> {
        await saveTest(buildTestPayload());

        if (!isSaved.value) return;

        await goToTests();
    }

    return {
        title,
        attempts,
        savedQuestions,
        editingQuestion,
        isEditing,
        isEmpty,
        savedCountLabel,
        currentTestId,
        listClass,
        submitLabel,
        isLoading,
        isLoadError,
        isSaving,
        isError,
        errorMessage,
        isSubmitDisabled,
        addQuestion,
        editQuestion,
        saveQuestion,
        cancelQuestion,
        removeQuestion,
        handleTitle,
        handleAttempts,
        handleSaveTest,
        loadTest,
    };
}
