import { ref } from 'vue';
import type { AxiosResponse } from 'axios';
import {
    answerRunnerRequest,
    finishRunnerRequest,
    getRunnerStateRequest,
    startRunnerRequest,
} from '@/api/runner';
import { useRunnerState } from '@/composables/runner/useRunnerState';
import { makeAxiosError } from '@/test/helpers/makeAxiosError';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';
import { makeRunnerResult } from '@/test/helpers/makeRunnerResult';
import { makeRunnerState } from '@/test/helpers/makeRunnerState';
import { RunnerStage } from '@/types/runner/TestRunner';
import type { RunnerState } from '@/types/runner/TestRunner';

vi.mock('@/api/runner', () => ({
    getRunnerStateRequest: vi.fn(),
    startRunnerRequest: vi.fn(),
    answerRunnerRequest: vi.fn(),
    positionRunnerRequest: vi.fn(),
    finishRunnerRequest: vi.fn(),
}));

const LINK = 'abc';
const SESSION_KEY = 'session-1';

function setup() {
    return useRunnerState(ref(LINK), ref(SESSION_KEY));
}

describe('useRunnerState', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it('starts on intro stage without state', () => {
        const { stage, isReady } = setup();

        expect(stage.value).toBe(RunnerStage.Intro);
        expect(isReady.value).toBe(false);
    });

    describe('loadState', () => {
        it('stores state requested by link and session key', async () => {
            const state = makeRunnerState();
            vi.mocked(getRunnerStateRequest).mockResolvedValue(makeAxiosResponse(state));
            const { state: current, stage, isReady, loadState } = setup();

            await loadState();

            expect(getRunnerStateRequest).toHaveBeenCalledWith(LINK, SESSION_KEY);
            expect(current.value).toEqual(state);
            expect(stage.value).toBe(RunnerStage.Question);
            expect(isReady.value).toBe(true);
        });

        it('shows loader while request is pending', async () => {
            const request = Promise.withResolvers<AxiosResponse<RunnerState>>();
            vi.mocked(getRunnerStateRequest).mockReturnValue(request.promise);
            const { isLoading, loadState } = setup();

            const loading = loadState();

            expect(isLoading.value).toBe(true);

            request.resolve(makeAxiosResponse(makeRunnerState()));
            await loading;

            expect(isLoading.value).toBe(false);
        });

        it('shows server message and drops previous state on failure', async () => {
            vi.mocked(getRunnerStateRequest)
                .mockResolvedValueOnce(makeAxiosResponse(makeRunnerState()))
                .mockRejectedValueOnce(makeAxiosError({ message: 'Тест закрыт' }));
            const { state, isError, errorMessage, isReady, isLoading, loadState } = setup();
            await loadState();

            await loadState();

            expect(state.value).toBeNull();
            expect(isError.value).toBe(true);
            expect(errorMessage.value).toBe('Тест закрыт');
            expect(isReady.value).toBe(false);
            expect(isLoading.value).toBe(false);
        });

        it('falls back to default message for non-axios error', async () => {
            vi.mocked(getRunnerStateRequest).mockRejectedValue(new Error('Network down'));
            const { errorMessage, loadState } = setup();

            await loadState();

            expect(errorMessage.value).toBe('Не удалось загрузить тест');
        });

        it('falls back to default message when server message is empty', async () => {
            vi.mocked(getRunnerStateRequest).mockRejectedValue(makeAxiosError({ message: '' }, 500));
            const { errorMessage, loadState } = setup();

            await loadState();

            expect(errorMessage.value).toBe('Не удалось загрузить тест');
        });

        it('clears previous error on successful reload', async () => {
            vi.mocked(getRunnerStateRequest)
                .mockRejectedValueOnce(new Error('Network down'))
                .mockResolvedValueOnce(makeAxiosResponse(makeRunnerState()));
            const { isError, errorMessage, loadState } = setup();
            await loadState();

            await loadState();

            expect(isError.value).toBe(false);
            expect(errorMessage.value).toBe('');
        });
    });

    describe('startTest', () => {
        it('stores state returned after start', async () => {
            const participant = { firstName: 'Иван', lastName: 'Петров' };
            const state = makeRunnerState();
            vi.mocked(startRunnerRequest).mockResolvedValue(makeAxiosResponse(state));
            const { state: current, isSubmitting, startTest } = setup();

            const isStarted = await startTest(participant);

            expect(isStarted).toBe(true);
            expect(startRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY, participant);
            expect(current.value).toEqual(state);
            expect(isSubmitting.value).toBe(false);
        });

        it('reports failure with server message', async () => {
            vi.mocked(startRunnerRequest).mockRejectedValue(makeAxiosError({ message: 'Попытки закончились' }));
            const { isSubmitting, errorMessage, startTest } = setup();

            const isStarted = await startTest({ firstName: 'Иван', lastName: 'Петров' });

            expect(isStarted).toBe(false);
            expect(errorMessage.value).toBe('Попытки закончились');
            expect(isSubmitting.value).toBe(false);
        });
    });

    describe('sendAnswer', () => {
        it('stores state returned after answer', async () => {
            const state = makeRunnerState({ answers: { '1': '11' } });
            vi.mocked(answerRunnerRequest).mockResolvedValue(makeAxiosResponse(state));
            const { state: current, sendAnswer } = setup();

            const isSent = await sendAnswer('1', '11');

            expect(isSent).toBe(true);
            expect(answerRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY, '1', '11');
            expect(current.value).toEqual(state);
        });

        it('keeps previous state when answer is rejected', async () => {
            const state = makeRunnerState();
            vi.mocked(getRunnerStateRequest).mockResolvedValue(makeAxiosResponse(state));
            vi.mocked(answerRunnerRequest).mockRejectedValue(new Error('Network down'));
            const { state: current, isSubmitting, errorMessage, loadState, sendAnswer } = setup();
            await loadState();

            const isSent = await sendAnswer('1', '11');

            expect(isSent).toBe(false);
            expect(current.value).toEqual(state);
            expect(errorMessage.value).toBe('Не удалось сохранить ответ');
            expect(isSubmitting.value).toBe(false);
        });
    });

    describe('finishTest', () => {
        it('reloads state after finish', async () => {
            const finished = makeRunnerState({ stage: RunnerStage.Result, result: makeRunnerResult() });
            vi.mocked(finishRunnerRequest).mockResolvedValue(makeAxiosResponse(makeRunnerResult()));
            vi.mocked(getRunnerStateRequest).mockResolvedValue(makeAxiosResponse(finished));
            const { state, stage, finishTest } = setup();

            const isFinished = await finishTest();

            expect(isFinished).toBe(true);
            expect(finishRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY);
            expect(state.value).toEqual(finished);
            expect(stage.value).toBe(RunnerStage.Result);
        });

        it('does not reload state when finish fails', async () => {
            vi.mocked(finishRunnerRequest).mockRejectedValue(new Error('Network down'));
            const { isSubmitting, errorMessage, finishTest } = setup();

            const isFinished = await finishTest();

            expect(isFinished).toBe(false);
            expect(getRunnerStateRequest).not.toHaveBeenCalled();
            expect(errorMessage.value).toBe('Не удалось завершить тест');
            expect(isSubmitting.value).toBe(false);
        });
    });
});
