import { computed, onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import { getTestRequest } from '@/api/test';
import { useTestMapper } from '@/composables/tests/useTestMapper';
import type { TestPayload } from '@/types/Test';

export function useTestLoading(testId: Ref<number | null>) {
    const { toTestPayload } = useTestMapper();

    const loadedTest: Ref<TestPayload | null> = ref(null);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const isError = computed((): boolean => errorMessage.value !== '');

    async function loadTest(): Promise<void> {
        const currentTestId = testId.value;

        if (currentTestId === null) return;

        errorMessage.value = '';
        isLoading.value = true;

        try {
            const { data } = await getTestRequest(currentTestId);
            const payload = toTestPayload(data);

            if (payload === null) {
                errorMessage.value = 'Сервер вернул некорректные данные теста.';
                return;
            }

            loadedTest.value = payload;
        } catch {
            errorMessage.value = 'Не удалось загрузить тест. Попробуйте ещё раз.';
        } finally {
            isLoading.value = false;
        }
    }

    onMounted(() => loadTest());

    return {
        loadedTest,
        isLoading,
        isError,
        errorMessage,
        loadTest,
    };
}
