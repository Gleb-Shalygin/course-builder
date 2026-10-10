import { useValidation } from '@/composables/tests/builder/useValidation';
import { makeAnswerOption } from '@/test/helpers/makeAnswerOption';
import { makeTestPayload } from '@/test/helpers/makeTestPayload';
import { makeTestQuestion } from '@/test/helpers/makeTestQuestion';
import { QuestionType } from '@/types/tests/Test';

describe('useValidation', () => {
    describe('validateQuestion', () => {
        it('accepts filled question with correct answer', () => {
            const { validateQuestion } = useValidation();

            expect(validateQuestion(makeTestQuestion())).toEqual({ valid: true });
        });

        it('rejects question with blank text', () => {
            const { validateQuestion } = useValidation();
            const question = makeTestQuestion({ text: '   ' });

            expect(validateQuestion(question)).toEqual({
                valid: false,
                message: 'Введите текст вопроса.',
            });
        });

        it('rejects single question with less than two filled answers', () => {
            const { validateQuestion } = useValidation();
            const question = makeTestQuestion({
                answers: [
                    makeAnswerOption({ id: 'answer-1', text: '4', isCorrect: true }),
                    makeAnswerOption({ id: 'answer-2', text: '  ' }),
                ],
            });

            expect(validateQuestion(question)).toEqual({
                valid: false,
                message: 'Заполните минимум 2 варианта ответа.',
            });
        });

        it('does not require two filled answers for true/false question', () => {
            const { validateQuestion } = useValidation();
            const question = makeTestQuestion({
                type: QuestionType.TrueFalse,
                answers: [
                    makeAnswerOption({ id: 'answer-1', text: 'Да', isCorrect: true }),
                    makeAnswerOption({ id: 'answer-2', text: '' }),
                ],
            });

            expect(validateQuestion(question)).toEqual({ valid: true });
        });

        it('rejects question without correct answer', () => {
            const { validateQuestion } = useValidation();
            const question = makeTestQuestion({
                answers: [
                    makeAnswerOption({ id: 'answer-1', text: '4' }),
                    makeAnswerOption({ id: 'answer-2', text: '5' }),
                ],
            });

            expect(validateQuestion(question)).toEqual({
                valid: false,
                message: 'Отметьте правильный вариант ответа.',
            });
        });

        it('ignores correct mark on blank answer', () => {
            const { validateQuestion } = useValidation();
            const question = makeTestQuestion({
                answers: [
                    makeAnswerOption({ id: 'answer-1', text: '4' }),
                    makeAnswerOption({ id: 'answer-2', text: '5' }),
                    makeAnswerOption({ id: 'answer-3', text: ' ', isCorrect: true }),
                ],
            });

            expect(validateQuestion(question)).toEqual({
                valid: false,
                message: 'Отметьте правильный вариант ответа.',
            });
        });
    });

    describe('validateTest', () => {
        it('accepts valid test', () => {
            const { validateTest } = useValidation();

            expect(validateTest(makeTestPayload())).toEqual({ valid: true });
        });

        it('rejects test with blank title', () => {
            const { validateTest } = useValidation();
            const payload = makeTestPayload({ title: '  ' });

            expect(validateTest(payload)).toEqual({
                valid: false,
                message: 'Введите название теста.',
            });
        });

        it('rejects test without questions', () => {
            const { validateTest } = useValidation();
            const payload = makeTestPayload({ questions: [] });

            expect(validateTest(payload)).toEqual({
                valid: false,
                message: 'Добавьте минимум один вопрос в тест.',
            });
        });

        it('rejects test with less than one attempt', () => {
            const { validateTest } = useValidation();
            const payload = makeTestPayload({ attempts: 0 });

            expect(validateTest(payload)).toEqual({
                valid: false,
                message: 'Количество попыток не может быть меньше 1.',
            });
        });

        it('returns error of first invalid question', () => {
            const { validateTest } = useValidation();
            const payload = makeTestPayload({
                questions: [
                    makeTestQuestion({ id: 'question-1' }),
                    makeTestQuestion({ id: 'question-2', text: '' }),
                    makeTestQuestion({
                        id: 'question-3',
                        answers: [makeAnswerOption({ text: '4' }), makeAnswerOption({ text: '5' })],
                    }),
                ],
            });

            expect(validateTest(payload)).toEqual({
                valid: false,
                message: 'Введите текст вопроса.',
            });
        });
    });
});
