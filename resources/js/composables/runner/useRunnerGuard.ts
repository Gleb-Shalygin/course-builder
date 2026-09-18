import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import { router } from '@inertiajs/vue3';

const LEAVE_CONFIRM = 'Тест не завершён. Если уйти со страницы, придётся вернуться к нему позже. Выйти?';


export function useRunnerGuard(isLocked: Ref<boolean>) {
    const removeInertiaListener = ref<(() => void) | null>(null);

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
        if (!isLocked.value) return;
        event.preventDefault();
        event.returnValue = '';
    };
    const handleInertiaBefore = (): boolean | void => {
        if (!isLocked.value) return;

        return window.confirm(LEAVE_CONFIRM);
    };

    onMounted((): void => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        removeInertiaListener.value = router.on('before', handleInertiaBefore);
    });

    onBeforeUnmount((): void => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (removeInertiaListener.value === null) return;
        removeInertiaListener.value();
        removeInertiaListener.value = null;
    });
}
