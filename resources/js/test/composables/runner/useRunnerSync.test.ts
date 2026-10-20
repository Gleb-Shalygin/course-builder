import { ref } from 'vue';
import type { App } from 'vue';
import { positionRunnerRequest } from '@/api/runner';
import { useRunnerSync } from '@/composables/runner/useRunnerSync';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';
import { makeRunnerState } from '@/test/helpers/makeRunnerState';
import { withSetup } from '@/test/helpers/withSetup';
import { RunnerStage } from '@/types/runner/TestRunner';

vi.mock('@/api/runner', () => ({
    positionRunnerRequest: vi.fn(),
}));

const LINK = 'abc';
const SESSION_KEY = 'session-1';
const SYNC_DELAY = 400;

describe('useRunnerSync', () => {
    let app: App | null = null;

    function setup() {
        const [sync, mounted] = withSetup(() => useRunnerSync(ref(LINK), ref(SESSION_KEY)));
        app = mounted;

        return sync;
    }

    beforeEach(() => {
        vi.mocked(positionRunnerRequest).mockResolvedValue(makeAxiosResponse(makeRunnerState()));
    });

    afterEach(() => {
        app?.unmount();
        app = null;
        vi.useRealTimers();
        vi.resetAllMocks();
    });

    describe('schedulePosition', () => {
        it('sends position only after delay', () => {
            vi.useFakeTimers();
            const { schedulePosition } = setup();

            schedulePosition(RunnerStage.Question, '2');
            vi.advanceTimersByTime(SYNC_DELAY - 1);

            expect(positionRunnerRequest).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);

            expect(positionRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY, RunnerStage.Question, '2');
        });

        it('sends only the latest position when called repeatedly', () => {
            vi.useFakeTimers();
            const { schedulePosition } = setup();

            schedulePosition(RunnerStage.Question, '1');
            schedulePosition(RunnerStage.Question, '2');
            schedulePosition(RunnerStage.Question, '3');
            vi.advanceTimersByTime(SYNC_DELAY);

            expect(positionRunnerRequest).toHaveBeenCalledTimes(1);
            expect(positionRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY, RunnerStage.Question, '3');
        });
    });

    describe('cancelPending', () => {
        it('drops scheduled position', () => {
            vi.useFakeTimers();
            const { schedulePosition, cancelPending } = setup();

            schedulePosition(RunnerStage.Question, '2');
            cancelPending();
            vi.advanceTimersByTime(SYNC_DELAY);

            expect(positionRunnerRequest).not.toHaveBeenCalled();
        });
    });

    describe('sendPosition', () => {
        it('shows warning when position is not saved', async () => {
            vi.mocked(positionRunnerRequest).mockRejectedValue(new Error('Network down'));
            const { syncError, sendPosition } = setup();

            await sendPosition(RunnerStage.Question, '2');

            expect(syncError.value).toBe('Не удалось сохранить текущий вопрос — после перезагрузки можете попасть на предыдущий');
        });

        it('clears warning after successful save', async () => {
            vi.mocked(positionRunnerRequest).mockRejectedValueOnce(new Error('Network down'));
            const { syncError, sendPosition } = setup();
            await sendPosition(RunnerStage.Question, '2');

            await sendPosition(RunnerStage.Question, '2');

            expect(syncError.value).toBe('');
        });
    });

    it('drops scheduled position on unmount', () => {
        vi.useFakeTimers();
        const { schedulePosition } = setup();
        schedulePosition(RunnerStage.Question, '2');

        app?.unmount();
        app = null;
        vi.advanceTimersByTime(SYNC_DELAY);

        expect(positionRunnerRequest).not.toHaveBeenCalled();
    });
});
