import { onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { getRunnerTestMock } from '@/mocks/testRunnerMock.ts';
import type { RunnerTest } from '@/types/runner/TestRunner.ts';

export function useRunnerTest(testLink: Ref<string | null>) {
    const test = ref<RunnerTest | null>(null);
    const isLoading = ref(false);
    const isError = ref(false);
    const errorMessage = ref('');

    watch(testLink, (): void => {
        void loadTest();
    });

    const setLoadError = (message: string): void => {
        test.value = null;
        isError.value = true;
        errorMessage.value = message;
    };
    const loadTest = async (): Promise<void> => {
        if (testLink.value === null) {
            setLoadError('Ссылка на тест некорректна');
            return;
        }
        isLoading.value = true;
        isError.value = false;
        errorMessage.value = '';
        try {
            test.value = await getRunnerTestMock(testLink.value);
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
