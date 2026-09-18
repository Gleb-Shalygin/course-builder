import { computed, onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useRunnerAnswers } from '@/composables/runner/useRunnerAnswers.ts';
import { useRunnerGuard } from '@/composables/runner/useRunnerGuard.ts';
import { useRunnerSession } from '@/composables/runner/useRunnerSession.ts';
import { useRunnerState } from '@/composables/runner/useRunnerState.ts';
import { useRunnerSync } from '@/composables/runner/useRunnerSync.ts';
import { RunnerStage } from '@/types/runner/TestRunner.ts';
import type {
    RunnerFinishState,
    RunnerIntro,
    RunnerNavState,
    RunnerPaginationItem,
    RunnerParticipantForm,
    RunnerQuestion,
    RunnerResult,
    RunnerSlide,
    RunnerState,
    RunnerTest,
} from '@/types/runner/TestRunner.ts';

export function useTestRunner(intro: Ref<RunnerIntro>) {
    const link = computed((): string => intro.value.link);
    const {
        sessionKey,
        ensureSessionKey,
        regenerateSessionKey,
    } = useRunnerSession();
    const {
        state,
        isLoading,
        isSubmitting,
        isError,
        errorMessage,
        isReady,
        loadState,
        startTest,
        sendAnswer,
        finishTest,
    } = useRunnerState(link, sessionKey);
    const {
        answeredCount,
        selectedAnswerId,
    } = useRunnerAnswers(state);
    const {
        syncError,
        sendPosition,
        schedulePosition,
        cancelPending,
    } = useRunnerSync(link, sessionKey);
    const stage = ref<RunnerStage>(RunnerStage.Intro);
    const questionIndex = ref(0);
    const isPositionRestored = ref(false);

    const test = computed((): RunnerTest => state.value?.test ?? {
        id: '',
        title: intro.value.title,
        description: intro.value.description,
        questionsCount: intro.value.questionsCount,
    });
    const questions = computed((): RunnerQuestion[] => state.value?.questions ?? []);
    const totalCount = computed((): number => test.value.questionsCount);
    const currentQuestion = computed((): RunnerQuestion | null => questions.value[questionIndex.value] ?? null);
    const currentQuestionId = computed((): string | null => currentQuestion.value?.id ?? null);
    const currentAnswerId = computed((): string | null => (currentQuestion.value === null ? null : selectedAnswerId(currentQuestion.value.id)));
    const result = computed((): RunnerResult | null => state.value?.result ?? null);
    const isIntro = computed((): boolean => stage.value === RunnerStage.Intro);
    const isQuestion = computed((): boolean => stage.value === RunnerStage.Question && currentQuestion.value !== null);
    const isFinish = computed((): boolean => stage.value === RunnerStage.Finish);
    const isResult = computed((): boolean => stage.value === RunnerStage.Result && result.value !== null);
    const isLocked = computed((): boolean => stage.value === RunnerStage.Question || stage.value === RunnerStage.Finish);
    const isProgressVisible = computed((): boolean => isQuestion.value);
    const isSyncWarningVisible = computed((): boolean => syncError.value !== '');
    // a-spin вешает обычный class на сам спиннер, поэтому классы обёртки
    // передаём через wrapper-class-name одной строкой.
    const loaderClass = computed((): string => (isQuestion.value ? 'runner__loader runner__loader--question' : 'runner__loader'));
    const isLastQuestion = computed((): boolean => questionIndex.value === totalCount.value - 1);
    const progressPercent = computed((): number => (totalCount.value === 0 ? 0 : Math.round(((questionIndex.value + 1) / totalCount.value) * 100)));
    const progressLabel = computed((): string => `Вопрос ${questionIndex.value + 1} из ${totalCount.value}`);
    const slide = computed((): RunnerSlide | null => (currentQuestion.value === null ? null : {
        number: questionIndex.value + 1,
        total: totalCount.value,
        question: currentQuestion.value,
        selectedAnswerId: currentAnswerId.value,
    }));
    const nav = computed((): RunnerNavState => ({
        isPrevDisabled: questionIndex.value === 0 || isSubmitting.value,
        isNextDisabled: currentAnswerId.value === null || isSubmitting.value,
        isLast: isLastQuestion.value,
        nextLabel: isLastQuestion.value ? 'Завершить' : 'Далее',
    }));
    const pagination = computed((): RunnerPaginationItem[] => questions.value.map((question, index) => ({
        id: question.id,
        number: index + 1,
        index,
        isActive: index === questionIndex.value,
        isAnswered: selectedAnswerId(question.id) !== null,
    })));
    const finishState = computed((): RunnerFinishState => ({
        answeredCount: answeredCount.value,
        totalCount: totalCount.value,
        isComplete: answeredCount.value === totalCount.value,
        hint: answeredCount.value === totalCount.value
            ? 'Все вопросы отвечены — можно завершать'
            : 'Есть вопросы без ответа, их можно пройти по кнопке «Назад»',
    }));

    // Стадию задаёт сервер всегда, а позицию — только один раз, при первом
    // получении состояния: так перезагрузка возвращает на тот же вопрос, но
    // ответ, пришедший вдогонку за прыжком по пагинации, не утаскивает обратно.
    watch((): RunnerState | null => state.value, (value): void => {
        if (value === null) return;
        stage.value = value.stage;
        if (isPositionRestored.value) return;
        questionIndex.value = questionIndexById(value.currentQuestionId);
        isPositionRestored.value = true;
    });

    // Индекс — внутренняя механика списка; наружу позиция всегда уходит id вопроса.
    const questionIndexById = (questionId: string | null): number => {
        if (questionId === null) return 0;
        const index = questions.value.findIndex((question): boolean => question.id === questionId);

        return index === -1 ? 0 : index;
    };
    const scheduleQuestionPosition = (index: number): void => {
        const questionId = questions.value[index]?.id ?? null;
        if (questionId === null) return;
        schedulePosition(RunnerStage.Question, questionId);
    };
    const syncStage = (value: RunnerStage): void => {
        if (currentQuestionId.value === null) return;
        void sendPosition(value, currentQuestionId.value);
    };
    const handleStart = async (participant: RunnerParticipantForm): Promise<void> => {
        await startTest(participant);
    };
    const handleSelect = async (answerId: string): Promise<void> => {
        if (currentQuestionId.value === null) return;
        await sendAnswer(currentQuestionId.value, answerId);
    };
    const goPrev = (): void => {
        if (isFinish.value) {
            stage.value = RunnerStage.Question;
            syncStage(RunnerStage.Question);

            return;
        }
        if (questionIndex.value === 0) return;
        questionIndex.value -= 1;
        scheduleQuestionPosition(questionIndex.value);
    };
    const goToQuestion = (questionId: string): void => {
        questionIndex.value = questionIndexById(questionId);
        stage.value = RunnerStage.Question;
        schedulePosition(RunnerStage.Question, questionId);
    };
    const goNext = (): void => {
        if (isLastQuestion.value) {
            stage.value = RunnerStage.Finish;
            syncStage(RunnerStage.Finish);

            return;
        }
        questionIndex.value += 1;
        scheduleQuestionPosition(questionIndex.value);
    };
    const handleFinish = async (): Promise<void> => {
        // Отложенная синхронизация позиции после финиша била бы в уже очищенный кеш.
        cancelPending();
        await finishTest();
    };
    const restartTest = async (): Promise<void> => {
        // Отложенный запрос ушёл бы уже под новым ключом, к которому попытки нет.
        cancelPending();
        regenerateSessionKey();
        isPositionRestored.value = false;
        questionIndex.value = 0;
        stage.value = RunnerStage.Intro;
        await loadState();
    };

    onMounted((): void => {
        ensureSessionKey();
        void loadState();
    });

    useRunnerGuard(isLocked);

    return {
        test,
        isLoading,
        isSubmitting,
        isError,
        errorMessage,
        syncError,
        isSyncWarningVisible,
        isReady,
        isIntro,
        isQuestion,
        isFinish,
        isResult,
        isProgressVisible,
        loaderClass,
        progressPercent,
        progressLabel,
        slide,
        nav,
        pagination,
        finishState,
        result,
        loadState,
        handleStart,
        handleSelect,
        goPrev,
        goNext,
        goToQuestion,
        handleFinish,
        restartTest,
    };
}
