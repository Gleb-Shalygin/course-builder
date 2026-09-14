import { onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { getRunnerTestMock } from '@/mocks/testRunnerMock.ts';
import type { RunnerTest } from '@/types/TestRunner.ts';

export function useRunnerTest(testId: Ref<number | null>) {
    const test = ref<RunnerTest | null>(null);
    const isLoading = ref(false);
    const isError = ref(false);
    const errorMessage = ref('');

    watch(testId, (): void => {
        void loadTest();
    });

    const setLoadError = (message: string): void => {
        test.value = null;
        isError.value = true;
        errorMessage.value = message;
    };
    const loadTest = async (): Promise<void> => {
        if (testId.value === null) {
            setLoadError('Ссылка на тест некорректна');
            return;
        }
        isLoading.value = true;
        isError.value = false;
        errorMessage.value = '';
        try {
            test.value = await getRunnerTestMock(testId.value);
        } catch {
            setLoadError('Не удалось загрузить тест');
        } finally {
            isLoading.value = false;
        }
    };

    onMounted((): void => {
        void loadTest();
    });

    return {
        test,
        isLoading,
        isError,
        errorMessage,
        loadTest,
    };
}
