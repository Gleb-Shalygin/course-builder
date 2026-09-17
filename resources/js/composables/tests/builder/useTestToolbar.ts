import { computed } from 'vue';
import type { Ref } from 'vue';
import { useTestLink } from '@/composables/tests/useTestLink';

type UpdateAttemptsEmit = (event: 'update:attempts', attempts: number) => void;

export function useTestToolbar(link: Ref<string | null>, emit: UpdateAttemptsEmit) {
    const {
        isCopied,
        isTouch,
        isLinkAvailable,
        label,
        copyHint,
        shareLink,
    } = useTestLink(link);

    const copyClass = computed((): string => (isCopied.value ? 'test-toolbar__copy--copied' : ''));

    const handleAttempts = (value: string | number): void => {
        const attempts = Number(value);

        if (!Number.isFinite(attempts)) return;

        emit('update:attempts', attempts);
    };
    const handleShare = async (): Promise<void> => {
        await shareLink();
    };

    return {
        isCopied,
        isTouch,
        isLinkAvailable,
        label,
        copyHint,
        copyClass,
        handleAttempts,
        handleShare,
    };
}
