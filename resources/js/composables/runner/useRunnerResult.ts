import { computed } from 'vue';
import type { Ref } from 'vue';
import type { RunnerQuestion, RunnerResult, RunnerResultItem, RunnerTest } from '@/types/runner/TestRunner.ts';

const SUCCESS_PERCENT = 80;
const NORMAL_PERCENT = 50;

export function useRunnerResult(test: Ref<RunnerTest | null>, selectedAnswers: Ref<Record<string, string>>) {
    const questions = computed((): RunnerQuestion[] => test.value?.questions ?? []);
    const items = computed((): RunnerResultItem[] => questions.value.map((question, index) => {
        const selectedId = selectedAnswers.value[question.id] ?? null;
        const selected = question.answers.find((answer) => answer.id === selectedId) ?? null;
        const correct = question.answers.find((answer) => answer.id === question.correctAnswerId) ?? null;
        return {
            number: index + 1,
            questionText: question.text,
            selectedText: selected === null ? null : selected.text,
            correctText: correct === null ? '' : correct.text,
            isCorrect: selectedId !== null && selectedId === question.correctAnswerId,
        };
    }));
    const correctCount = computed((): number => items.value.filter((item) => item.isCorrect).length);
    const totalCount = computed((): number => items.value.length);
    const percent = computed((): number => (totalCount.value === 0 ? 0 : Math.round((correctCount.value / totalCount.value) * 100)));
    const status = computed((): RunnerResult['status'] => {
        if (percent.value >= SUCCESS_PERCENT) return 'success';
        if (percent.value >= NORMAL_PERCENT) return 'normal';
        return 'exception';
    });
    const title = computed((): string => {
        if (percent.value >= SUCCESS_PERCENT) return 'Отличный результат!';
        if (percent.value >= NORMAL_PERCENT) return 'Неплохо, но есть куда расти';
        return 'Стоит попробовать ещё раз';
    });
    const result = computed((): RunnerResult => ({
        items: items.value,
        correctCount: correctCount.value,
        totalCount: totalCount.value,
        percent: percent.value,
        title: title.value,
        status: status.value,
    }));

    return {
        result,
    };
}
