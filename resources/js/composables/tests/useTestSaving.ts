import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { message } from 'ant-design-vue';
import { createTestRequest } from '@/api/test';
import { useValidation } from '@/composables/tests/useValidation';
import type { TestPayload } from '@/types/Test';

export function useTestSaving() {
    const { validateTest } = useValidation();

    const isSaving = ref(false);
    const errorMessage = ref('');
    const savedTestId: Ref<string | null> = ref(null);

    const isError = computed((): boolean => errorMessage.value !== '');
    const isSaved = computed((): boolean => savedTestId.value !== null);

    async function saveTest(payload: TestPayload): Promise<void> {
        const result = validateTest(payload);

        if (!result.valid) {
            errorMessage.value = result.message ?? 'Проверьте заполнение теста.';
            return;
        }

        errorMessage.value = '';
        isSaving.value = true;

        try {
            const { data } = await createTestRequest(payload);
            const createdId = data.data.id;

            if (typeof createdId !== 'string') {
                errorMessage.value = 'Сервер вернул некорректный ответ при сохранении теста.';
                return;
            }

            savedTestId.value = createdId;
            message.success('Тест сохранён');
        } catch {
            errorMessage.value = 'Не удалось сохранить тест. Попробуйте ещё раз.';
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
