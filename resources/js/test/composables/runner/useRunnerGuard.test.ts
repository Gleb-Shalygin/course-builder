import { ref } from 'vue';
import type { App } from 'vue';
import { router } from '@inertiajs/vue3';
import { useRunnerGuard } from '@/composables/runner/useRunnerGuard';
import { withSetup } from '@/test/helpers/withSetup';

type InertiaBeforeListener = () => boolean | void;

const inertia = vi.hoisted(() => {
    const listeners: InertiaBeforeListener[] = [];

    return {
        listeners,
        removeListener: vi.fn(),
    };
});

vi.mock('@inertiajs/vue3', () => ({
    router: {
        on: vi.fn((_event: string, listener: InertiaBeforeListener) => {
            inertia.listeners.push(listener);

            return inertia.removeListener;
        }),
    },
}));

function dispatchBeforeUnload(): Event {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);

    return event;
}

function runInertiaBefore(): boolean | void {
    const listener = inertia.listeners.at(-1);
    if (listener === undefined) throw new Error('Inertia before listener is not registered');

    return listener();
}

describe('useRunnerGuard', () => {
    let app: App | null = null;
    const confirm = vi.fn<(message?: string) => boolean>();

    function setup(isLocked: boolean) {
        const locked = ref(isLocked);
        const [, mounted] = withSetup(() => useRunnerGuard(locked));
        app = mounted;

        return locked;
    }

    beforeEach(() => {
        inertia.listeners.length = 0;
        // В happy-dom нет window.confirm.
        vi.stubGlobal('confirm', confirm);
    });

    afterEach(() => {
        app?.unmount();
        app = null;
        vi.unstubAllGlobals();
        confirm.mockReset();
        inertia.removeListener.mockReset();
    });

    it('subscribes to Inertia navigation on mount', () => {
        setup(true);

        expect(router.on).toHaveBeenCalledWith('before', expect.any(Function));
    });

    describe('beforeunload', () => {
        it('allows leaving page when runner is not locked', () => {
            setup(false);

            const event = dispatchBeforeUnload();

            expect(event.defaultPrevented).toBe(false);
        });

        it('prevents leaving page while runner is locked', () => {
            setup(true);

            const event = dispatchBeforeUnload();

            expect(event.defaultPrevented).toBe(true);
        });

        it('follows lock changes after mount', () => {
            const locked = setup(true);

            locked.value = false;
            const event = dispatchBeforeUnload();

            expect(event.defaultPrevented).toBe(false);
        });
    });

    describe('Inertia navigation', () => {
        it('allows navigation without confirmation when runner is not locked', () => {
            setup(false);

            const result = runInertiaBefore();

            expect(result).toBeUndefined();
            expect(confirm).not.toHaveBeenCalled();
        });

        it('cancels navigation when user declines confirmation', () => {
            confirm.mockReturnValue(false);
            setup(true);

            const result = runInertiaBefore();

            expect(confirm).toHaveBeenCalledWith('Тест не завершён. Если уйти со страницы, придётся вернуться к нему позже. Выйти?');
            expect(result).toBe(false);
        });

        it('allows navigation when user confirms leaving', () => {
            confirm.mockReturnValue(true);
            setup(true);

            const result = runInertiaBefore();

            expect(result).toBe(true);
        });
    });

    it('removes listeners on unmount', () => {
        setup(true);

        app?.unmount();
        app = null;
        const event = dispatchBeforeUnload();

        expect(event.defaultPrevented).toBe(false);
        expect(inertia.removeListener).toHaveBeenCalledTimes(1);
    });
});
