import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import type { App } from 'vue';
import type { AxiosResponse } from 'axios';
import {
    answerRunnerRequest,
    finishRunnerRequest,
    getRunnerStateRequest,
    positionRunnerRequest,
} from '@/api/runner';
import { useTestRunner } from '@/composables/runner/useTestRunner';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';
import { makeRunnerResult } from '@/test/helpers/makeRunnerResult';
import { makeRunnerState } from '@/test/helpers/makeRunnerState';
import { withSetup } from '@/test/helpers/withSetup';
import { RunnerStage } from '@/types/runner/TestRunner';
import type { RunnerIntro, RunnerState } from '@/types/runner/TestRunner';

vi.mock('@/api/runner', () => ({
    getRunnerStateRequest: vi.fn(),
    startRunnerRequest: vi.fn(),
    answerRunnerRequest: vi.fn(),
    positionRunnerRequest: vi.fn(),
    finishRunnerRequest: vi.fn(),
}));

vi.mock('@inertiajs/vue3', () => ({
    router: {
        on: vi.fn(() => vi.fn()),
    },
}));

const LINK = 'abc';
const SESSION_KEY = 'session-1';
const STORAGE_KEY = 'runner_session';
const SYNC_DELAY = 400;

const INTRO: RunnerIntro = {
    link: LINK,
    title: 'Арифметика',
    description: 'Проверка устного счёта',
    questionsCount: 3,
};

describe('useTestRunner', () => {
    let app: App | null = null;

    async function setup(state: RunnerState | null = makeRunnerState(), intro: RunnerIntro = INTRO) {
        if (state === null) {
            vi.mocked(getRunnerStateRequest).mockRejectedValue(new Error('Network down'));
        } else {
            vi.mocked(getRunnerStateRequest).mockResolvedValue(makeAxiosResponse(state));
        }
        const [runner, mounted] = withSetup(() => useTestRunner(ref(intro)));
        app = mounted;
        await flushPromises();

        return runner;
    }

    beforeEach(() => {
        window.localStorage.clear();
        window.localStorage.setItem(STORAGE_KEY, SESSION_KEY);
        vi.mocked(positionRunnerRequest).mockResolvedValue(makeAxiosResponse(makeRunnerState()));
    });

    afterEach(() => {
        app?.unmount();
        app = null;
        vi.useRealTimers();
        vi.resetAllMocks();
    });

    describe('loading', () => {
        it('loads state with stored session key on mount', async () => {
            await setup();

            expect(getRunnerStateRequest).toHaveBeenCalledWith(LINK, SESSION_KEY);
        });

        it('shows intro data when state is not loaded', async () => {
            const { test, isError, isIntro } = await setup(null);

            expect(isError.value).toBe(true);
            expect(isIntro.value).toBe(true);
            expect(test.value).toEqual({
                id: '',
                title: INTRO.title,
                description: INTRO.description,
                questionsCount: INTRO.questionsCount,
            });
        });

        it('shows zero progress when test has no questions', async () => {
            const { progressPercent } = await setup(null, { ...INTRO, questionsCount: 0 });

            expect(progressPercent.value).toBe(0);
        });
    });

    describe('position restore', () => {
        it('opens question saved on server', async () => {
            const { isQuestion, slide } = await setup(makeRunnerState({ currentQuestionId: '2' }));

            expect(isQuestion.value).toBe(true);
            expect(slide.value?.number).toBe(2);
            expect(slide.value?.question.id).toBe('2');
        });

        it('opens first question when saved question is unknown', async () => {
            const { slide } = await setup(makeRunnerState({ currentQuestionId: 'missing' }));

            expect(slide.value?.number).toBe(1);
        });

        it('keeps local position when answer response arrives after jump', async () => {
            const answer = Promise.withResolvers<AxiosResponse<RunnerState>>();
            vi.mocked(answerRunnerRequest).mockReturnValue(answer.promise);
            const { slide, handleSelect, goToQuestion } = await setup();

            const selecting = handleSelect('11');
            goToQuestion('3');
            answer.resolve(makeAxiosResponse(makeRunnerState({ answers: { '1': '11' }, currentQuestionId: '1' })));
            await selecting;

            expect(slide.value?.number).toBe(3);
        });
    });

    describe('progress', () => {
        it('describes current question position', async () => {
            const { progressLabel, progressPercent, isProgressVisible } = await setup(makeRunnerState({ currentQuestionId: '2' }));

            expect(isProgressVisible.value).toBe(true);
            expect(progressLabel.value).toBe('Вопрос 2 из 3');
            expect(progressPercent.value).toBe(67);
        });
    });

    describe('handleSelect', () => {
        it('sends answer for current question and marks it answered', async () => {
            vi.mocked(answerRunnerRequest).mockResolvedValue(makeAxiosResponse(makeRunnerState({ answers: { '1': '11' } })));
            const { slide, pagination, handleSelect } = await setup();

            await handleSelect('11');

            expect(answerRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY, '1', '11');
            expect(slide.value?.selectedAnswerId).toBe('11');
            expect(pagination.value.map((item) => item.isAnswered)).toEqual([true, false, false]);
        });
    });

    describe('nav', () => {
        it('disables next until current question is answered', async () => {
            const { nav } = await setup();

            expect(nav.value.isNextDisabled).toBe(true);
        });

        it('enables next for answered question', async () => {
            const { nav } = await setup(makeRunnerState({ answers: { '1': '11' } }));

            expect(nav.value.isNextDisabled).toBe(false);
        });

        it('disables previous on first question', async () => {
            const { nav } = await setup();

            expect(nav.value.isPrevDisabled).toBe(true);
        });

        it('labels next as finish on last question', async () => {
            const { nav } = await setup(makeRunnerState({ currentQuestionId: '3' }));

            expect(nav.value.isLast).toBe(true);
            expect(nav.value.nextLabel).toBe('Завершить');
        });

        it('disables navigation while answer is being saved', async () => {
            const answer = Promise.withResolvers<AxiosResponse<RunnerState>>();
            vi.mocked(answerRunnerRequest).mockReturnValue(answer.promise);
            const { nav, handleSelect } = await setup(makeRunnerState({ currentQuestionId: '2', answers: { '2': '21' } }));

            const selecting = handleSelect('22');

            expect(nav.value.isPrevDisabled).toBe(true);
            expect(nav.value.isNextDisabled).toBe(true);

            answer.resolve(makeAxiosResponse(makeRunnerState({ answers: { '2': '22' } })));
            await selecting;
        });
    });

    describe('goNext', () => {
        it('opens next question and saves position after delay', async () => {
            const { slide, goNext } = await setup();
            vi.useFakeTimers();

            goNext();

            expect(slide.value?.number).toBe(2);
            expect(positionRunnerRequest).not.toHaveBeenCalled();

            vi.advanceTimersByTime(SYNC_DELAY);

            expect(positionRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY, RunnerStage.Question, '2');
        });

        it('opens finish screen from last question and saves stage immediately', async () => {
            const { isFinish, isQuestion, goNext } = await setup(makeRunnerState({ currentQuestionId: '3' }));

            goNext();

            expect(isFinish.value).toBe(true);
            expect(isQuestion.value).toBe(false);
            expect(positionRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY, RunnerStage.Finish, '3');
        });
    });

    describe('goPrev', () => {
        it('stays on first question', async () => {
            const { slide, goPrev } = await setup();
            vi.useFakeTimers();

            goPrev();
            vi.advanceTimersByTime(SYNC_DELAY);

            expect(slide.value?.number).toBe(1);
            expect(positionRunnerRequest).not.toHaveBeenCalled();
        });

        it('opens previous question and saves position after delay', async () => {
            const { slide, goPrev } = await setup(makeRunnerState({ currentQuestionId: '2' }));
            vi.useFakeTimers();

            goPrev();
            vi.advanceTimersByTime(SYNC_DELAY);

            expect(slide.value?.number).toBe(1);
            expect(positionRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY, RunnerStage.Question, '1');
        });

        it('returns from finish screen to last question', async () => {
            const { isQuestion, slide, goPrev } = await setup(makeRunnerState({ stage: RunnerStage.Finish, currentQuestionId: '3' }));

            goPrev();

            expect(isQuestion.value).toBe(true);
            expect(slide.value?.number).toBe(3);
            expect(positionRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY, RunnerStage.Question, '3');
        });
    });

    describe('goToQuestion', () => {
        it('opens question by id from finish screen', async () => {
            const { isQuestion, slide, pagination, goToQuestion } = await setup(makeRunnerState({ stage: RunnerStage.Finish, currentQuestionId: '3' }));
            vi.useFakeTimers();

            goToQuestion('2');
            vi.advanceTimersByTime(SYNC_DELAY);

            expect(isQuestion.value).toBe(true);
            expect(slide.value?.number).toBe(2);
            expect(pagination.value.map((item) => item.isActive)).toEqual([false, true, false]);
            expect(positionRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY, RunnerStage.Question, '2');
        });
    });

    describe('finishState', () => {
        it('warns about unanswered questions', async () => {
            const { finishState } = await setup(makeRunnerState({ stage: RunnerStage.Finish, answers: { '1': '11' } }));

            expect(finishState.value).toEqual({
                answeredCount: 1,
                totalCount: 3,
                isComplete: false,
                hint: 'Есть вопросы без ответа, их можно пройти по кнопке «Назад»',
            });
        });

        it('allows finishing when all questions are answered', async () => {
            const { finishState } = await setup(makeRunnerState({
                stage: RunnerStage.Finish,
                answers: { '1': '11', '2': '21', '3': '31' },
            }));

            expect(finishState.value.isComplete).toBe(true);
            expect(finishState.value.hint).toBe('Все вопросы отвечены — можно завершать');
        });
    });

    describe('handleFinish', () => {
        it('shows result after finish', async () => {
            const result = makeRunnerResult();
            const { isResult, result: shownResult, handleFinish } = await setup(makeRunnerState({ stage: RunnerStage.Finish }));
            vi.mocked(finishRunnerRequest).mockResolvedValue(makeAxiosResponse(result));
            vi.mocked(getRunnerStateRequest).mockResolvedValue(makeAxiosResponse(makeRunnerState({ stage: RunnerStage.Result, result })));

            await handleFinish();

            expect(finishRunnerRequest).toHaveBeenCalledWith(LINK, SESSION_KEY);
            expect(isResult.value).toBe(true);
            expect(shownResult.value).toEqual(result);
        });

        it('cancels pending position save', async () => {
            const { goNext, handleFinish } = await setup(makeRunnerState({ answers: { '1': '11' } }));
            vi.mocked(finishRunnerRequest).mockResolvedValue(makeAxiosResponse(makeRunnerResult()));
            vi.useFakeTimers();
            goNext();

            await handleFinish();
            vi.advanceTimersByTime(SYNC_DELAY);

            expect(positionRunnerRequest).not.toHaveBeenCalled();
        });
    });

    describe('restartTest', () => {
        it('reloads state under a new session key', async () => {
            const { isIntro, restartTest } = await setup(makeRunnerState({ stage: RunnerStage.Result, result: makeRunnerResult() }));
            vi.mocked(getRunnerStateRequest).mockResolvedValue(makeAxiosResponse(makeRunnerState({
                stage: RunnerStage.Intro,
                currentQuestionId: null,
                participant: null,
            })));

            await restartTest();

            const newKey = window.localStorage.getItem(STORAGE_KEY);
            expect(newKey).not.toBe(SESSION_KEY);
            expect(getRunnerStateRequest).toHaveBeenLastCalledWith(LINK, newKey);
            expect(isIntro.value).toBe(true);
        });

        it('restores position from server again', async () => {
            const { slide, restartTest } = await setup(makeRunnerState({ currentQuestionId: '2' }));
            vi.mocked(getRunnerStateRequest).mockResolvedValue(makeAxiosResponse(makeRunnerState({ currentQuestionId: '3' })));

            await restartTest();

            expect(slide.value?.number).toBe(3);
        });

        it('cancels pending position save', async () => {
            const { goNext, restartTest } = await setup(makeRunnerState({ answers: { '1': '11' } }));
            vi.useFakeTimers();
            goNext();

            await restartTest();
            vi.advanceTimersByTime(SYNC_DELAY);

            expect(positionRunnerRequest).not.toHaveBeenCalled();
        });
    });
});
