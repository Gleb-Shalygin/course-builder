import { ref } from 'vue';
import { useAnswersEditor } from '@/composables/tests/builder/useAnswersEditor';
import { makeAnswerOption } from '@/test/helpers/makeAnswerOption';
import type { AnswerOption } from '@/types/tests/Test';

function makeAnswers(count: number): AnswerOption[] {
    return Array.from({ length: count }, (_, index) => makeAnswerOption({ id: `answer-${index + 1}`, text: `Ответ ${index + 1}` }));
}

describe('useAnswersEditor', () => {
    describe('correctAnswerId', () => {
        it('returns id of correct answer', () => {
            const answers = makeAnswers(3);
            answers[1].isCorrect = true;
            const { correctAnswerId } = useAnswersEditor(ref(answers), ref(true));

            expect(correctAnswerId.value).toBe('answer-2');
        });

        it('returns empty string when no answer is correct', () => {
            const { correctAnswerId } = useAnswersEditor(ref(makeAnswers(2)), ref(true));

            expect(correctAnswerId.value).toBe('');
        });
    });

    describe('isAddVisible', () => {
        it('allows adding answers below limit', () => {
            const { isAddVisible } = useAnswersEditor(ref(makeAnswers(7)), ref(true));

            expect(isAddVisible.value).toBe(true);
        });

        it('hides adding when limit of eight answers is reached', () => {
            const { isAddVisible } = useAnswersEditor(ref(makeAnswers(8)), ref(true));

            expect(isAddVisible.value).toBe(false);
        });

        it('hides adding for not editable answers', () => {
            const { isAddVisible } = useAnswersEditor(ref(makeAnswers(2)), ref(false));

            expect(isAddVisible.value).toBe(false);
        });
    });

    describe('isRemoveVisible', () => {
        it('allows removing answers above minimum', () => {
            const { isRemoveVisible } = useAnswersEditor(ref(makeAnswers(3)), ref(true));

            expect(isRemoveVisible.value).toBe(true);
        });

        it('hides removing when only two answers left', () => {
            const { isRemoveVisible } = useAnswersEditor(ref(makeAnswers(2)), ref(true));

            expect(isRemoveVisible.value).toBe(false);
        });

        it('hides removing for not editable answers', () => {
            const { isRemoveVisible } = useAnswersEditor(ref(makeAnswers(3)), ref(false));

            expect(isRemoveVisible.value).toBe(false);
        });
    });

    describe('withNewAnswer', () => {
        it('appends empty answer without changing current list', () => {
            const answers = ref(makeAnswers(2));
            const { withNewAnswer } = useAnswersEditor(answers, ref(true));

            const result = withNewAnswer();

            expect(result).toHaveLength(3);
            expect(result[2]).toMatchObject({ persistedId: null, text: '', isCorrect: false });
            expect(answers.value).toHaveLength(2);
        });
    });

    describe('withoutAnswer', () => {
        it('removes answer by id', () => {
            const { withoutAnswer } = useAnswersEditor(ref(makeAnswers(3)), ref(true));

            const result = withoutAnswer('answer-2');

            expect(result.map((answer) => answer.id)).toEqual(['answer-1', 'answer-3']);
        });
    });

    describe('withAnswerText', () => {
        it('changes text of one answer', () => {
            const { withAnswerText } = useAnswersEditor(ref(makeAnswers(2)), ref(true));

            const result = withAnswerText('answer-2', 'Новый текст');

            expect(result.map((answer) => answer.text)).toEqual(['Ответ 1', 'Новый текст']);
        });

        it('does not mutate current answers', () => {
            const answers = ref(makeAnswers(2));
            const { withAnswerText } = useAnswersEditor(answers, ref(true));

            withAnswerText('answer-2', 'Новый текст');

            expect(answers.value[1].text).toBe('Ответ 2');
        });
    });

    describe('withCorrectAnswer', () => {
        it('leaves only one correct answer', () => {
            const answers = makeAnswers(3);
            answers[0].isCorrect = true;
            const { withCorrectAnswer } = useAnswersEditor(ref(answers), ref(true));

            const result = withCorrectAnswer('answer-3');

            expect(result.map((answer) => answer.isCorrect)).toEqual([false, false, true]);
        });

        it('does not mutate current answers', () => {
            const answers = ref(makeAnswers(2));
            const { withCorrectAnswer } = useAnswersEditor(answers, ref(true));

            withCorrectAnswer('answer-2');

            expect(answers.value[1].isCorrect).toBe(false);
        });
    });
});
