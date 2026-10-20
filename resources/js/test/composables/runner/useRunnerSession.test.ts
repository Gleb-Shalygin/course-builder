import { useRunnerSession } from '@/composables/runner/useRunnerSession';

const STORAGE_KEY = 'runner_session';
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// happy-dom держит методы на самом экземпляре storage, поэтому spyOn(Storage.prototype) не срабатывает.
function stubStorage(overrides: Partial<Pick<Storage, 'getItem' | 'setItem'>>): void {
    vi.stubGlobal('localStorage', {
        getItem: (): string | null => null,
        setItem: (): void => undefined,
        ...overrides,
    });
}

describe('useRunnerSession', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('ensureSessionKey', () => {
        it('reuses key from storage', () => {
            window.localStorage.setItem(STORAGE_KEY, 'stored-key');
            const { sessionKey, ensureSessionKey } = useRunnerSession();

            const key = ensureSessionKey();

            expect(key).toBe('stored-key');
            expect(sessionKey.value).toBe('stored-key');
        });

        it('generates and stores key when storage is empty', () => {
            const { sessionKey, ensureSessionKey } = useRunnerSession();

            const key = ensureSessionKey();

            expect(key).toMatch(UUID_V4_PATTERN);
            expect(sessionKey.value).toBe(key);
            expect(window.localStorage.getItem(STORAGE_KEY)).toBe(key);
        });

        it('treats empty stored value as missing key', () => {
            window.localStorage.setItem(STORAGE_KEY, '');
            const { ensureSessionKey } = useRunnerSession();

            const key = ensureSessionKey();

            expect(key).toMatch(UUID_V4_PATTERN);
        });

        it('marks storage as blocked and still generates key when reading fails', () => {
            stubStorage({
                getItem: () => {
                    throw new Error('SecurityError');
                },
            });
            const { sessionKey, isStorageBlocked, ensureSessionKey } = useRunnerSession();

            const key = ensureSessionKey();

            expect(isStorageBlocked.value).toBe(true);
            expect(key).toMatch(UUID_V4_PATTERN);
            expect(sessionKey.value).toBe(key);
        });

        it('marks storage as blocked and still returns key when writing fails', () => {
            stubStorage({
                setItem: () => {
                    throw new Error('QuotaExceededError');
                },
            });
            const { sessionKey, isStorageBlocked, ensureSessionKey } = useRunnerSession();

            const key = ensureSessionKey();

            expect(isStorageBlocked.value).toBe(true);
            expect(sessionKey.value).toBe(key);
        });
    });

    describe('regenerateSessionKey', () => {
        it('replaces stored key with a new one', () => {
            window.localStorage.setItem(STORAGE_KEY, 'stored-key');
            const { sessionKey, ensureSessionKey, regenerateSessionKey } = useRunnerSession();
            ensureSessionKey();

            const key = regenerateSessionKey();

            expect(key).not.toBe('stored-key');
            expect(sessionKey.value).toBe(key);
            expect(window.localStorage.getItem(STORAGE_KEY)).toBe(key);
        });

        it('generates uuid v4 when crypto.randomUUID is unavailable', () => {
            vi.stubGlobal('crypto', {});
            const { regenerateSessionKey } = useRunnerSession();

            const key = regenerateSessionKey();

            expect(key).toMatch(UUID_V4_PATTERN);
        });
    });
});
