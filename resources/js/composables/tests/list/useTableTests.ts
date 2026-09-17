import { computed, onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import { getTestsRequest } from '@/api/test';
import type { TestTableItem } from '@/types/tests/TestTableItem';

export function useTableTests() {
    const tests: Ref<TestTableItem[]> = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref('');

    const isError = computed((): boolean => errorMessage.value !== '');

    async function getTests(): Promise<void> {
        errorMessage.value = '';
        isLoading.value = true;

        try {
            const { data } = await getTestsRequest();
            tests.value = data.data;
        } catch {
            errorMessage.value = 'Не удалось загрузить тесты. Попробуйте ещё раз.';
        } finally {
            isLoading.value = false;
        }
    }

    onMounted(() => getTests());

    return {
        tests,
        isLoading,
        isError,
        errorMessage,
    };
}
