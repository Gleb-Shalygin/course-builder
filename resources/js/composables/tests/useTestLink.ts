import { computed, ref } from 'vue';
import type { Ref } from 'vue';

const COPIED_RESET_TIMEOUT = 2000;

export function useTestLink(testId: Ref<string | null>) {
    const isCopied = ref(false);
    const errorMessage = ref('');

    const testLink = computed((): string | null => (testId.value === null ? null : `${window.location.origin}/tests/${testId.value}`));
    const isCopyDisabled = computed((): boolean => testLink.value === null);
    const isError = computed((): boolean => errorMessage.value !== '');
    const copyLabel = computed((): string => (isCopied.value ? 'Ссылка скопирована' : 'Скопировать ссылку'));
    const copyHint = computed((): string => (isCopyDisabled.value
        ? 'Ссылка появится после сохранения теста'
        : 'Ссылка на прохождение теста'));

    async function copyLink(): Promise<void> {
        const link = testLink.value;
        if (link === null) return;

        errorMessage.value = '';

        try {
            await navigator.clipboard.writeText(link);
            isCopied.value = true;
            window.setTimeout(() => {
                isCopied.value = false;
            }, COPIED_RESET_TIMEOUT);
        } catch {
            errorMessage.value = 'Не удалось скопировать ссылку';
        }
    }

    return {
        testLink,
        isCopied,
        isCopyDisabled,
        isError,
        errorMessage,
        copyLabel,
        copyHint,
        copyLink,
    };
}
