import { flushPromises } from '@vue/test-utils';
import type { App } from 'vue';
import { getTestsRequest } from '@/api/test';
import { useProfileStats } from '@/composables/profile/useProfileStats';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';
import { makeTestTableItem } from '@/test/helpers/makeTestTableItem';
import { withSetup } from '@/test/helpers/withSetup';
import type { TestTableItem } from '@/types/tests/TestTableItem';

vi.mock('@/api/test', () => ({
    getTestsRequest: vi.fn(),
}));

describe('useProfileStats', () => {
    let app: App | null = null;

    function setup(tests: TestTableItem[] = []) {
        vi.mocked(getTestsRequest).mockResolvedValue(makeAxiosResponse({ data: tests }));
        const [stats, mounted] = withSetup(() => useProfileStats());
        app = mounted;

        return stats;
    }

    afterEach(() => {
        app?.unmount();
        app = null;
        vi.resetAllMocks();
    });

    it('counts tests, public tests and finished attempts', async () => {
        const {
            testsCount,
            publicTestsCount,
            finishedCount,
            isError,
        } = setup([
            makeTestTableItem({ id: 1, is_public: true, count_finished: 3 }),
            makeTestTableItem({ id: 2, is_public: false, count_finished: 0 }),
            makeTestTableItem({ id: 3, is_public: true, count_finished: 5 }),
        ]);
        await flushPromises();

        expect(getTestsRequest).toHaveBeenCalledTimes(1);
        expect(testsCount.value).toBe(3);
        expect(publicTestsCount.value).toBe(2);
        expect(finishedCount.value).toBe(8);
        expect(isError.value).toBe(false);
    });

    it('shows zeros when there are no tests', async () => {
        const { testsCount, publicTestsCount, finishedCount } = setup();
        await flushPromises();

        expect(testsCount.value).toBe(0);
        expect(publicTestsCount.value).toBe(0);
        expect(finishedCount.value).toBe(0);
    });

    it('shows loader while request is pending', async () => {
        const { loading } = setup();

        expect(loading.value).toBe(true);

        await flushPromises();

        expect(loading.value).toBe(false);
    });

    it('shows error when request fails', async () => {
        vi.mocked(getTestsRequest).mockRejectedValue(new Error('Network down'));
        const [stats, mounted] = withSetup(() => useProfileStats());
        app = mounted;
        await flushPromises();

        expect(stats.isError.value).toBe(true);
        expect(stats.errorMessage.value).toBe('Не удалось загрузить статистику тестов');
        expect(stats.testsCount.value).toBe(0);
        expect(stats.loading.value).toBe(false);
    });
});
