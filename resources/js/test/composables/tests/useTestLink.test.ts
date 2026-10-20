import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { useTestLink } from '@/composables/tests/useTestLink';

vi.mock('ant-design-vue', () => ({
    message: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const LINK = 'https://example.com/runner/abc';
const COPIED_RESET_TIMEOUT = 2000;

describe('useTestLink', () => {
    const writeText = vi.fn();
    const share = vi.fn();

    function stubDevice(isTouch: boolean, canShare = true): void {
        vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: isTouch })));
        vi.stubGlobal('navigator', {
            clipboard: { writeText },
            share: canShare ? share : undefined,
        });
    }

    beforeEach(() => {
        writeText.mockResolvedValue(undefined);
        share.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.resetAllMocks();
    });

    it('is unavailable without link', async () => {
        stubDevice(false);
        const { isLinkAvailable, shareLink } = useTestLink(ref(null));

        await shareLink();

        expect(isLinkAvailable.value).toBe(false);
        expect(writeText).not.toHaveBeenCalled();
    });

    describe('desktop', () => {
        it('offers to copy link', () => {
            stubDevice(false);

            const { isTouch, label } = useTestLink(ref(LINK));

            expect(isTouch.value).toBe(false);
            expect(label.value).toBe('Скопировать ссылку');
        });

        it('copies link to clipboard', async () => {
            stubDevice(false);
            const { isCopied, label, shareLink } = useTestLink(ref(LINK));

            await shareLink('Арифметика');

            expect(writeText).toHaveBeenCalledWith(LINK);
            expect(share).not.toHaveBeenCalled();
            expect(isCopied.value).toBe(true);
            expect(label.value).toBe('Ссылка скопирована');
            expect(message.success).toHaveBeenCalledWith('Ссылка скопирована');
        });

        it('resets copied state after timeout', async () => {
            vi.useFakeTimers();
            stubDevice(false);
            const { isCopied, shareLink } = useTestLink(ref(LINK));
            await shareLink();

            vi.advanceTimersByTime(COPIED_RESET_TIMEOUT - 1);

            expect(isCopied.value).toBe(true);

            vi.advanceTimersByTime(1);

            expect(isCopied.value).toBe(false);
        });

        it('shows error when clipboard is unavailable', async () => {
            stubDevice(false);
            writeText.mockRejectedValue(new Error('Permission denied'));
            const { isCopied, shareLink } = useTestLink(ref(LINK));

            await shareLink();

            expect(isCopied.value).toBe(false);
            expect(message.error).toHaveBeenCalledWith('Не удалось скопировать ссылку');
        });
    });

    describe('touch device', () => {
        it('offers to share link', () => {
            stubDevice(true);

            const { isTouch, label } = useTestLink(ref(LINK));

            expect(isTouch.value).toBe(true);
            expect(label.value).toBe('Поделиться');
        });

        it('shares link with title', async () => {
            stubDevice(true);
            const { shareLink } = useTestLink(ref(LINK));

            await shareLink('Арифметика');

            expect(share).toHaveBeenCalledWith({ title: 'Арифметика', url: LINK });
            expect(writeText).not.toHaveBeenCalled();
        });

        it('stays silent when user cancels sharing', async () => {
            stubDevice(true);
            const error = new Error('Share canceled');
            error.name = 'AbortError';
            share.mockRejectedValue(error);
            const { shareLink } = useTestLink(ref(LINK));

            await shareLink();

            expect(message.error).not.toHaveBeenCalled();
        });

        it('shows error when sharing fails', async () => {
            stubDevice(true);
            share.mockRejectedValue(new Error('Share failed'));
            const { shareLink } = useTestLink(ref(LINK));

            await shareLink();

            expect(message.error).toHaveBeenCalledWith('Не удалось поделиться ссылкой');
        });

        it('copies link when sharing is not supported', async () => {
            stubDevice(true, false);
            const { shareLink } = useTestLink(ref(LINK));

            await shareLink();

            expect(writeText).toHaveBeenCalledWith(LINK);
        });
    });
});
