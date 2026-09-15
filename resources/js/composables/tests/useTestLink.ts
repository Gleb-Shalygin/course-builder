import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { message } from 'ant-design-vue';

const COPIED_RESET_TIMEOUT = 2000;
const COPY_HINT = 'Ссылка на прохождение теста';

function isTouchDevice(): boolean {
    return window.matchMedia('(pointer: coarse)').matches;
}

export function useTestLink(link: Ref<string | null>) {
    const isCopied = ref(false);
    const isTouch = ref(isTouchDevice());

    const isLinkAvailable = computed((): boolean => link.value !== null);
    const label = computed((): string => {
        if (isTouch.value) return 'Поделиться';

        return isCopied.value ? 'Ссылка скопирована' : 'Скопировать ссылку';
    });

    async function copyToClipboard(value: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(value);
            isCopied.value = true;
            message.success('Ссылка скопирована');
            window.setTimeout(() => {
                isCopied.value = false;
            }, COPIED_RESET_TIMEOUT);
        } catch {
            message.error('Не удалось скопировать ссылку');
        }
    }
    async function shareLink(shareTitle?: string): Promise<void> {
        const value = link.value;
        if (value === null) return;

        if (isTouch.value && navigator.share) {
            try {
                await navigator.share({ title: shareTitle, url: value });
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return;

                message.error('Не удалось поделиться ссылкой');
            }
            return;
        }

        await copyToClipboard(value);
    }

    return {
        isLinkAvailable,
        isTouch,
        isCopied,
        label,
        copyHint: COPY_HINT,
        shareLink,
    };
}
