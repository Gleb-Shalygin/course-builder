import { nextTick, ref } from 'vue';
import { useQuestionEditor } from '@/composables/tests/builder/useQuestionEditor';
import { makeAnswerOption } from '@/test/helpers/makeAnswerOption';
import { makeTestQuestion } from '@/test/helpers/makeTestQuestion';
import { QuestionType } from '@/types/tests/Test';

describe('useQuestionEditor', () => {
    it('edits copy of question', () => {
        const question = ref(makeTestQuestion());
        const { draft } = useQuestionEditor(question);

        draft.value.text = 'Черновик';
        draft.value.answers[0].text = 'Черновик';

        expect(question.value.text).toBe('Сколько будет 2 + 2?');
        expect(question.value.answers[0].text).toBe('4');
    });

    it('offers single and true/false types', () => {
        const { typeOptions } = useQuestionEditor(ref(makeTestQuestion()));

        expect(typeOptions.value.map((option) => option.value)).toEqual([QuestionType.Single, QuestionType.TrueFalse]);
    });

    it('allows editing answers of single question', () => {
        const { isAnswersEditable, answersHint } = useQuestionEditor(ref(makeTestQuestion()));

        expect(isAnswersEditable.value).toBe(true);
        expect(answersHint.value).toBe('Отметьте правильный вариант ответа');
    });

    describe('setType', () => {
        it('switches to true/false with preset answers', () => {
            const {
                draft,
                isAnswersEditable,
                answersHint,
                setType,
            } = useQuestionEditor(ref(makeTestQuestion()));

            setType(QuestionType.TrueFalse);

            expect(draft.value.type).toBe(QuestionType.TrueFalse);
            expect(draft.value.answers.map(({ text, isCorrect }) => ({ text, isCorrect }))).toEqual([
                { text: 'Да', isCorrect: true },
                { text: 'Нет', isCorrect: false },
            ]);
            expect(isAnswersEditable.value).toBe(false);
            expect(answersHint.value).toBe('Выберите, какой ответ считается правильным');
        });

        it('switches to single with two empty answers', () => {
            const question = makeTestQuestion({ type: QuestionType.TrueFalse });
            const { draft, setType } = useQuestionEditor(ref(question));

            setType(QuestionType.Single);

            expect(draft.value.type).toBe(QuestionType.Single);
            expect(draft.value.answers.map(({ text, isCorrect }) => ({ text, isCorrect }))).toEqual([
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ]);
        });

        it('keeps answers when type is not changed', () => {
            const { draft, setType } = useQuestionEditor(ref(makeTestQuestion()));

            setType(QuestionType.Single);

            expect(draft.value.answers.map((answer) => answer.text)).toEqual(['4', '5']);
        });

        it('treats unknown value as single type', () => {
            const question = makeTestQuestion({ type: QuestionType.TrueFalse });
            const { draft, setType } = useQuestionEditor(ref(question));

            setType('unknown');

            expect(draft.value.type).toBe(QuestionType.Single);
        });

        it('clears validation error', () => {
            const question = makeTestQuestion({ text: '' });
            const { isError, validate, setType } = useQuestionEditor(ref(question));
            validate();

            setType(QuestionType.TrueFalse);

            expect(isError.value).toBe(false);
        });
    });

    describe('setAnswers', () => {
        it('replaces answers of draft', () => {
            const { draft, setAnswers } = useQuestionEditor(ref(makeTestQuestion()));
            const answers = [
                makeAnswerOption({ id: 'answer-3', text: '3' }),
                makeAnswerOption({ id: 'answer-4', text: '4', isCorrect: true }),
            ];

            setAnswers(answers);

            expect(draft.value.answers).toEqual(answers);
        });
    });

    describe('validate', () => {
        it('accepts valid draft', () => {
            const { isError, errorMessage, validate } = useQuestionEditor(ref(makeTestQuestion()));

            expect(validate()).toBe(true);
            expect(isError.value).toBe(false);
            expect(errorMessage.value).toBe('');
        });

        it('shows error for invalid draft', () => {
            const { isError, errorMessage, validate } = useQuestionEditor(ref(makeTestQuestion({ text: '  ' })));

            expect(validate()).toBe(false);
            expect(isError.value).toBe(true);
            expect(errorMessage.value).toBe('Введите текст вопроса.');
        });

        it('clears error after draft is fixed', () => {
            const { draft, isError, validate } = useQuestionEditor(ref(makeTestQuestion({ text: '' })));
            validate();

            draft.value.text = 'Сколько будет 2 + 2?';
            validate();

            expect(isError.value).toBe(false);
        });
    });

    describe('question change', () => {
        it('resets draft and error for another question', async () => {
            const question = ref(makeTestQuestion({ text: '' }));
            const { draft, isError, validate } = useQuestionEditor(question);
            validate();

            question.value = makeTestQuestion({ id: 'question-2', text: 'Столица Франции?' });
            await nextTick();

            expect(draft.value.id).toBe('question-2');
            expect(draft.value.text).toBe('Столица Франции?');
            expect(isError.value).toBe(false);
        });

        it('keeps draft when same question is updated', async () => {
            const question = ref(makeTestQuestion());
            const { draft } = useQuestionEditor(question);
            draft.value.text = 'Черновик';

            question.value = makeTestQuestion({ text: 'Обновлено снаружи' });
            await nextTick();

            expect(draft.value.text).toBe('Черновик');
        });
    });
});
