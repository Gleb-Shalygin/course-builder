import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import axios from 'axios';
import {
    answerRunnerRequest,
    finishRunnerRequest,
    getRunnerStateRequest,
    startRunnerRequest,
} from '@/api/runner.ts';
import { RunnerStage } from '@/types/runner/TestRunner.ts';
import type { RunnerParticipantForm, RunnerState } from '@/types/runner/TestRunner.ts';

function resolveErrorMessage(error: unknown, fallback: string): string {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }

    const message: unknown = error.response?.data?.message;

    return typeof message === 'string' && message !== '' ? message : fallback;
}

export function useRunnerState(link: Ref<string>, sessionKey: Ref<string>) {
    const state = ref<RunnerState | null>(null);
    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const isError = ref(false);
    const errorMessage = ref('');

    const isReady = computed((): boolean => !isLoading.value && !isError.value && state.value !== null);
    const stage = computed((): RunnerStage => state.value?.stage ?? RunnerStage.Intro);

    const setError = (message: string): void => {
        isError.value = true;
        errorMessage.value = message;
    };
    const clearError = (): void => {
        isError.value = false;
        errorMessage.value = '';
    };
    const loadState = async (): Promise<void> => {
        isLoading.value = true;
        clearError();

        try {
            const response = await getRunnerStateRequest(link.value, sessionKey.value);
            state.value = response.data;
        } catch (error: unknown) {
            state.value = null;
            setError(resolveErrorMessage(error, 'Не удалось загрузить тест'));
        } finally {
            isLoading.value = false;
        }
    };
    const startTest = async (participant: RunnerParticipantForm): Promise<boolean> => {
        isSubmitting.value = true;
        clearError();

        try {
            const response = await startRunnerRequest(link.value, sessionKey.value, participant);
            state.value = response.data;

            return true;
        } catch (error: unknown) {
            setError(resolveErrorMessage(error, 'Не удалось начать тест'));

            return false;
        } finally {
            isSubmitting.value = false;
        }
    };
    const sendAnswer = async (questionId: string, answerId: string): Promise<boolean> => {
        isSubmitting.value = true;
        clearError();

        try {
            const response = await answerRunnerRequest(link.value, sessionKey.value, questionId, answerId);
            state.value = response.data;

            return true;
        } catch (error: unknown) {
            setError(resolveErrorMessage(error, 'Не удалось сохранить ответ'));

            return false;
        } finally {
            isSubmitting.value = false;
        }
    };
    const finishTest = async (): Promise<boolean> => {
        isSubmitting.value = true;
        clearError();

        try {
            await finishRunnerRequest(link.value, sessionKey.value);
            await loadState();

            return true;
        } catch (error: unknown) {
            setError(resolveErrorMessage(error, 'Не удалось завершить тест'));

            return false;
        } finally {
            isSubmitting.value = false;
        }
    };

    return {
        state,
        stage,
        isLoading,
        isSubmitting,
        isError,
        errorMessage,
        isReady,
        loadState,
        startTest,
        sendAnswer,
        finishTest,
    };
}
