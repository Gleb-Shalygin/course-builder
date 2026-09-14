import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { message } from 'ant-design-vue';
import { createTestRequest, updateTestRequest } from '@/api/test';
import { useValidation } from '@/composables/tests/useValidation';
import type { TestPayload } from '@/types/Test';

export function useTestSaving(testId: Ref<number | null>) {
    const { validateTest } = useValidation();

    const isSaving = ref(false);
    const errorMessage = ref('');
    const savedTestId: Ref<number | null> = ref(null);

    const isEdit = computed((): boolean => testId.value !== null);
    const isError = computed((): boolean => errorMessage.value !== '');
    const isSaved = computed((): boolean => savedTestId.value !== null);
    const successMessage = computed((): string => (isEdit.value ? 'Изменения сохранены' : 'Тест сохранён'));
    const failureMessage = computed((): string => (isEdit.value
        ? 'Не удалось сохранить изменения. Попробуйте ещё раз.'
        : 'Не удалось сохранить тест. Попробуйте ещё раз.'));

    function sendTest(payload: TestPayload) {
        const currentTestId = testId.value;

        if (currentTestId === null) {
            return createTestRequest(payload);
        }

        return updateTestRequest(currentTestId, payload);
    }
    async function saveTest(payload: TestPayload): Promise<void> {
        const result = validateTest(payload);

        if (!result.valid) {
            errorMessage.value = result.message ?? 'Проверьте заполнение теста.';
            return;
        }

        errorMessage.value = '';
        isSaving.value = true;

        try {
            const { data } = await sendTest(payload);
            const currentId = data.id;

            if (typeof currentId !== 'number') {
                errorMessage.value = 'Сервер вернул некорректный ответ при сохранении теста.';
                return;
            }

            savedTestId.value = currentId;
            message.success(successMessage.value);
        } catch {
            errorMessage.value = failureMessage.value;
        } finally {
            isSaving.value = false;
        }
    }

    return {
        isSaving,
        isSaved,
        isError,
        errorMessage,
        savedTestId,
        saveTest,
    };
}
