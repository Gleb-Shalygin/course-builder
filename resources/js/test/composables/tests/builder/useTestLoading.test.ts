import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import type { App } from 'vue';
import type { AxiosResponse } from 'axios';
import { getTestRequest } from '@/api/test';
import { useTestLoading } from '@/composables/tests/builder/useTestLoading';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';
import { makeTestDetail } from '@/test/helpers/makeTestDetail';
import { withSetup } from '@/test/helpers/withSetup';
import type { TestDetail } from '@/types/tests/Test';

vi.mock('@/api/test', () => ({
    getTestRequest: vi.fn(),
}));

describe('useTestLoading', () => {
    let app: App | null = null;

    function setup(testId: number | null = 5) {
        const [loading, mounted] = withSetup(() => useTestLoading(ref(testId)));
        app = mounted;

        return loading;
    }

    beforeEach(() => {
        vi.mocked(getTestRequest).mockResolvedValue(makeAxiosResponse(makeTestDetail({ link: 'abc' })));
    });

    afterEach(() => {
        app?.unmount();
        app = null;
        vi.resetAllMocks();
    });

    it('loads test on mount', async () => {
        const { loadedTest, testLink, isError } = setup();
        await flushPromises();

        expect(getTestRequest).toHaveBeenCalledWith(5);
        expect(loadedTest.value?.title).toBe('Арифметика');
        expect(loadedTest.value?.questions.map((question) => question.persistedId)).toEqual([10]);
        expect(testLink.value).toBe('abc');
        expect(isError.value).toBe(false);
    });

    it('does not request new test', async () => {
        const { loadedTest, isLoading } = setup(null);
        await flushPromises();

        expect(getTestRequest).not.toHaveBeenCalled();
        expect(loadedTest.value).toBeNull();
        expect(isLoading.value).toBe(false);
    });

    it('shows loader while request is pending', async () => {
        const request = Promise.withResolvers<AxiosResponse<TestDetail>>();
        vi.mocked(getTestRequest).mockReturnValue(request.promise);
        const { isLoading } = setup();

        expect(isLoading.value).toBe(true);

        request.resolve(makeAxiosResponse(makeTestDetail()));
        await flushPromises();

        expect(isLoading.value).toBe(false);
    });

    it('shows error when request fails', async () => {
        vi.mocked(getTestRequest).mockRejectedValue(new Error('Network down'));
        const {
            loadedTest,
            isLoading,
            isError,
            errorMessage,
        } = setup();
        await flushPromises();

        expect(loadedTest.value).toBeNull();
        expect(isLoading.value).toBe(false);
        expect(isError.value).toBe(true);
        expect(errorMessage.value).toBe('Не удалось загрузить тест. Попробуйте ещё раз.');
    });

    it('clears error after successful retry', async () => {
        vi.mocked(getTestRequest).mockRejectedValueOnce(new Error('Network down'));
        const {
            loadedTest,
            isError,
            loadTest,
        } = setup();
        await flushPromises();

        await loadTest();

        expect(isError.value).toBe(false);
        expect(loadedTest.value?.title).toBe('Арифметика');
    });
});
