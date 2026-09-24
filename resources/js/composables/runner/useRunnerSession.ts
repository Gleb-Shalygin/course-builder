import { ref } from 'vue';

const STORAGE_KEY = 'runner_session';

export function useRunnerSession() {
    const sessionKey = ref('');
    const isStorageBlocked = ref(false);

    const createKey = (): string => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char): string => {
            const random = Math.floor(Math.random() * 16);
            const value = char === 'x' ? random : (random & 0x3) | 0x8;

            return value.toString(16);
        });
    };
    const readStoredKey = (): string | null => {
        try {
            return window.localStorage.getItem(STORAGE_KEY);
        } catch {
            isStorageBlocked.value = true;

            return null;
        }
    };
    const writeStoredKey = (key: string): void => {
        try {
            window.localStorage.setItem(STORAGE_KEY, key);
        } catch {
            isStorageBlocked.value = true;
        }
    };
    const ensureSessionKey = (): string => {
        const stored = readStoredKey();

        if (stored !== null && stored !== '') {
            sessionKey.value = stored;

            return stored;
        }

        return regenerateSessionKey();
    };
    const regenerateSessionKey = (): string => {
        const key = createKey();
        sessionKey.value = key;
        writeStoredKey(key);

        return key;
    };

    return {
        sessionKey,
        isStorageBlocked,
        ensureSessionKey,
        regenerateSessionKey,
    };
}
