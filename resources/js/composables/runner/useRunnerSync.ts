import { onBeforeUnmount, ref } from 'vue';
import type { Ref } from 'vue';
import { positionRunnerRequest } from '@/api/runner.ts';
import type { RunnerStage } from '@/types/runner/TestRunner.ts';

const SYNC_DELAY = 400;


export function useRunnerSync(link: Ref<string>, sessionKey: Ref<string>) {
    const syncError = ref('');
    const timer = ref<ReturnType<typeof setTimeout> | null>(null);

    const cancelPending = (): void => {
        if (timer.value === null) return;
        clearTimeout(timer.value);
        timer.value = null;
    };
    const sendPosition = async (stage: RunnerStage, questionId: string): Promise<void> => {
        try {
            await positionRunnerRequest(link.value, sessionKey.value, stage, questionId);
            syncError.value = '';
        } catch {
            syncError.value = 'Не удалось сохранить текущий вопрос — после перезагрузки можете попасть на предыдущий';
        }
    };
    const schedulePosition = (stage: RunnerStage, questionId: string): void => {
        cancelPending();
        timer.value = setTimeout((): void => {
            void sendPosition(stage, questionId);
        }, SYNC_DELAY);
    };

    onBeforeUnmount((): void => {
        cancelPending();
    });

    return {
        syncError,
        sendPosition,
        schedulePosition,
        cancelPending,
    };
}
