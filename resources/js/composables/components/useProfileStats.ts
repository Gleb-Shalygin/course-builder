import { computed, onMounted, ref } from 'vue';
import { getTestsRequest } from '@/api/test';
import type { TestTableItem } from '@/types/TestTableItem';

export function useProfileStats() {
    const tests = ref<TestTableItem[]>([]);
    const loading = ref(false);
    const errorMessage = ref('');

    const testsCount = computed((): number => tests.value.length);
    const publicTestsCount = computed((): number => tests.value.filter((test) => test.is_public).length);
    const finishedCount = computed((): number => tests.value.reduce((sum, test) => sum + test.count_finished, 0));
    const isError = computed((): boolean => errorMessage.value !== '');

    async function loadStats(): Promise<void> {
        loading.value = true;
        errorMessage.value = '';

        try {
            const { data } = await getTestsRequest();
            tests.value = data.data;
        } catch {
            errorMessage.value = 'Не удалось загрузить статистику тестов';
        } finally {
            loading.value = false;
        }
    }

    onMounted(() => loadStats());

    return {
        loading,
        errorMessage,
        isError,
        testsCount,
        publicTestsCount,
        finishedCount,
    };
}
