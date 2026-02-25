import { ref } from 'vue';
import type { Ref } from 'vue';
import type { TestDraft, TestPayload } from '@/types/Test';

const STORAGE_KEY = 'draftTests';
const MAX_DRAFTS = 5;

const parseDrafts = (raw: string | null): TestDraft[] => {
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as TestDraft[];
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch {
        return [];
    }
};

const persistDrafts = (drafts: TestDraft[]) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch {
        // ignore storage errors
    }
};

export const useDraftTests = () => {
    const drafts: Ref<TestDraft[]> = ref([]);
    const maxDrafts = MAX_DRAFTS;

    const loadDrafts = () => {
        if (typeof window === 'undefined') return;
        drafts.value = parseDrafts(window.localStorage.getItem(STORAGE_KEY));
    };

    const saveDraft = (payload: TestPayload) => {
        if (typeof window === 'undefined') return;

        const now = new Date().toISOString();
        const newDraft: TestDraft = {
            id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: now,
            updatedAt: now,
            ...payload,
        };

        const updatedDrafts = [...drafts.value, newDraft].slice(-MAX_DRAFTS);
        drafts.value = updatedDrafts;
        persistDrafts(updatedDrafts);
    };

    const clearDrafts = () => {
        drafts.value = [];
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore
        }
    };

    return {
        drafts,
        maxDrafts,
        loadDrafts,
        saveDraft,
        clearDrafts,
    };
};

