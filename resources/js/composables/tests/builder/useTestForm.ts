import { computed, watch } from 'vue';
import type { Ref } from 'vue';
import { useTestBuilder } from '@/composables/tests/builder/useTestBuilder';
import { useTestLoading } from '@/composables/tests/builder/useTestLoading';
import { useTestSaving } from '@/composables/tests/builder/useTestSaving';
import { useTestsNavigation } from '@/composables/tests/useTestsNavigation';
import type { TestFormFooterState, TestPayload } from '@/types/tests/Test.ts';

export function useTestForm(testId: Ref<number | null>) {
    const { goToTests } = useTestsNavigation();
    const {
        title,
        description,
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
        testLink,
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
        saveTest,
    } = useTestSaving(testId);

    const isEdit = computed((): boolean => testId.value !== null);
    const listClass = computed((): string => (isEditing.value ? 'test-form__list--locked' : ''));
    const submitLabel = computed((): string => (isEdit.value ? 'Сохранить' : 'Сохранить тест'));
    const isError = computed((): boolean => isLoadError.value || isSaveError.value);
    const errorMessage = computed((): string => (isLoadError.value ? loadErrorMessage.value : saveErrorMessage.value));
    const isSubmitDisabled = computed((): boolean => isLoading.value || isLoadError.value);
    const footer = computed((): TestFormFooterState => ({
        label: submitLabel.value,
        isSaving: isSaving.value,
        isDisabled: isSubmitDisabled.value,
    }));

    watch(loadedTest, (payload: TestPayload | null): void => {
        if (payload === null) return;

        applyTestPayload(payload);
    });

    function handleTitle(value: string): void {
        title.value = value;
    }
    function handleDescription(value: string): void {
        description.value = value.trim() === '' ? null : value;
    }
    function handleAttempts(value: number): void {
        attempts.value = value;
    }
    async function handleSaveTest(): Promise<void> {
        await saveTest(buildTestPayload());

        if (!isSaved.value) return;

        goToTests();
    }

    return {
        title,
        description,
        attempts,
        savedQuestions,
        editingQuestion,
        isEditing,
        isEmpty,
        savedCountLabel,
        testLink,
        listClass,
        footer,
        isLoading,
        isLoadError,
        isError,
        errorMessage,
        addQuestion,
        editQuestion,
        saveQuestion,
        cancelQuestion,
        removeQuestion,
        handleTitle,
        handleDescription,
        handleAttempts,
        handleSaveTest,
        loadTest,
    };
}
