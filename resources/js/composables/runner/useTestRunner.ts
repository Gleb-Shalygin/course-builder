import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { useRunnerAnswers } from '@/composables/runner/useRunnerAnswers.ts';
import { useRunnerResult } from '@/composables/runner/useRunnerResult.ts';
import { useRunnerTest } from '@/composables/runner/useRunnerTest.ts';
import { RunnerStage } from '@/types/TestRunner.ts';
import type { RunnerFinishState, RunnerNavState, RunnerPaginationItem, RunnerQuestion, RunnerSlide } from '@/types/TestRunner.ts';

export function useTestRunner(testId: Ref<number | null>) {
    const { test, isLoading, isError, errorMessage, loadTest } = useRunnerTest(testId);
    const { selectedAnswers, answeredCount, selectedAnswerId, selectAnswer, resetAnswers } = useRunnerAnswers();
    const { result } = useRunnerResult(test, selectedAnswers);
    const stage = ref<RunnerStage>(RunnerStage.Intro);
    const questionIndex = ref(0);

    const questions = computed((): RunnerQuestion[] => test.value?.questions ?? []);
    const totalCount = computed((): number => questions.value.length);
    const currentQuestion = computed((): RunnerQuestion | null => questions.value[questionIndex.value] ?? null);
    const currentAnswerId = computed((): string | null => (currentQuestion.value === null ? null : selectedAnswerId(currentQuestion.value.id)));
    const isReady = computed((): boolean => !isLoading.value && !isError.value && totalCount.value > 0);
    const isIntro = computed((): boolean => stage.value === RunnerStage.Intro);
    const isQuestion = computed((): boolean => stage.value === RunnerStage.Question && currentQuestion.value !== null);
    const isFinish = computed((): boolean => stage.value === RunnerStage.Finish);
    const isResult = computed((): boolean => stage.value === RunnerStage.Result);
    const isProgressVisible = computed((): boolean => isQuestion.value);
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
        isPrevDisabled: questionIndex.value === 0,
        isNextDisabled: currentAnswerId.value === null,
        isLast: isLastQuestion.value,
        nextLabel: isLastQuestion.value ? 'Завершить' : 'Далее',
    }));
    const pagination = computed((): RunnerPaginationItem[] => questions.value.map((question, index) => ({
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

    const startTest = (): void => {
        questionIndex.value = 0;
        stage.value = RunnerStage.Question;
    };
    const handleSelect = (answerId: string): void => {
        if (currentQuestion.value === null) return;
        selectAnswer(currentQuestion.value.id, answerId);
    };
    const goPrev = (): void => {
        if (isFinish.value) {
            stage.value = RunnerStage.Question;
            return;
        }
        if (questionIndex.value === 0) return;
        questionIndex.value -= 1;
    };
    const goToQuestion = (index: number): void => {
        questionIndex.value = index;
        stage.value = RunnerStage.Question;
    };
    const goNext = (): void => {
        if (isLastQuestion.value) {
            stage.value = RunnerStage.Finish;
            return;
        }
        questionIndex.value += 1;
    };
    const finishTest = (): void => {
        stage.value = RunnerStage.Result;
    };
    const restartTest = (): void => {
        resetAnswers();
        questionIndex.value = 0;
        stage.value = RunnerStage.Intro;
    };

    return {
        test,
        isLoading,
        isError,
        errorMessage,
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
        loadTest,
        startTest,
        handleSelect,
        goPrev,
        goNext,
        goToQuestion,
        finishTest,
        restartTest,
    };
}
