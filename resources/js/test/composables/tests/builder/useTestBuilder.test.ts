import { useTestBuilder } from '@/composables/tests/builder/useTestBuilder';
import { makeTestPayload } from '@/test/helpers/makeTestPayload';
import { makeTestQuestion } from '@/test/helpers/makeTestQuestion';

describe('useTestBuilder', () => {
    function setupWithQuestions(count: number) {
        const builder = useTestBuilder();
        const questions = Array.from({ length: count }, (_, index) => makeTestQuestion({ id: `question-${index + 1}` }));
        builder.applyTestPayload(makeTestPayload({ questions }));

        return builder;
    }

    it('starts with empty test', () => {
        const {
            title,
            description,
            attempts,
            isEmpty,
            isEditing,
            savedCountLabel,
        } = useTestBuilder();

        expect(title.value).toBe('');
        expect(description.value).toBeNull();
        expect(attempts.value).toBe(1);
        expect(isEmpty.value).toBe(true);
        expect(isEditing.value).toBe(false);
        expect(savedCountLabel.value).toBe('0 вопросов');
    });

    describe('addQuestion', () => {
        it('adds new question in editing mode', () => {
            const {
                editingQuestion,
                isEditing,
                isEmpty,
                savedCount,
                addQuestion,
            } = useTestBuilder();

            addQuestion();

            expect(isEditing.value).toBe(true);
            expect(isEmpty.value).toBe(false);
            expect(savedCount.value).toBe(0);
            expect(editingQuestion.value?.persistedId).toBeNull();
        });

        it('ignores add while another question is edited', () => {
            const {
                editingQuestion,
                isEditing,
                savedCount,
                addQuestion,
                saveQuestion,
            } = useTestBuilder();
            addQuestion();
            const editingId = editingQuestion.value?.id;

            addQuestion();
            saveQuestion(makeTestQuestion({ id: editingId }));

            expect(isEditing.value).toBe(false);
            expect(savedCount.value).toBe(1);
        });
    });

    describe('saveQuestion', () => {
        it('saves edited content of question', () => {
            const {
                editingQuestion,
                savedQuestions,
                isEditing,
                addQuestion,
                saveQuestion,
            } = useTestBuilder();
            addQuestion();
            const question = makeTestQuestion({ id: editingQuestion.value?.id, text: 'Столица Франции?' });

            saveQuestion(question);

            expect(isEditing.value).toBe(false);
            expect(savedQuestions.value).toEqual([{ ...question, isSaved: true }]);
        });

        it('stores copy of passed question', () => {
            const {
                editingQuestion,
                savedQuestions,
                addQuestion,
                saveQuestion,
            } = useTestBuilder();
            addQuestion();
            const question = makeTestQuestion({ id: editingQuestion.value?.id });

            saveQuestion(question);
            question.text = 'Изменено после сохранения';
            question.answers[0].text = 'Изменено после сохранения';

            expect(savedQuestions.value[0].text).toBe('Сколько будет 2 + 2?');
            expect(savedQuestions.value[0].answers[0].text).toBe('4');
        });

        it('ignores unknown question', () => {
            const {
                isEditing,
                savedCount,
                addQuestion,
                saveQuestion,
            } = useTestBuilder();
            addQuestion();

            saveQuestion(makeTestQuestion({ id: 'missing' }));

            expect(isEditing.value).toBe(true);
            expect(savedCount.value).toBe(0);
        });
    });

    describe('editQuestion', () => {
        it('moves saved question to editing mode', () => {
            const { editingQuestion, savedCount, editQuestion } = setupWithQuestions(2);

            editQuestion('question-2');

            expect(editingQuestion.value?.id).toBe('question-2');
            expect(savedCount.value).toBe(1);
        });

        it('ignores edit while another question is edited', () => {
            const { editingQuestion, editQuestion } = setupWithQuestions(2);
            editQuestion('question-1');

            editQuestion('question-2');

            expect(editingQuestion.value?.id).toBe('question-1');
        });

        it('ignores unknown question', () => {
            const { isEditing, editQuestion } = setupWithQuestions(1);

            editQuestion('missing');

            expect(isEditing.value).toBe(false);
        });
    });

    describe('cancelQuestion', () => {
        it('removes new question', () => {
            const {
                editingQuestion,
                isEmpty,
                isEditing,
                addQuestion,
                cancelQuestion,
            } = useTestBuilder();
            addQuestion();

            cancelQuestion(editingQuestion.value?.id ?? '');

            expect(isEditing.value).toBe(false);
            expect(isEmpty.value).toBe(true);
        });

        it('restores saved version of edited question', () => {
            const {
                editingQuestion,
                savedQuestions,
                editQuestion,
                cancelQuestion,
            } = setupWithQuestions(1);
            editQuestion('question-1');
            const question = editingQuestion.value;
            if (question === null) throw new Error('Question is not in editing mode');
            question.text = 'Черновик';
            question.answers[0].text = 'Черновик';

            cancelQuestion('question-1');

            expect(savedQuestions.value).toEqual([makeTestQuestion({ isSaved: true })]);
        });

        it('keeps position of restored question', () => {
            const { savedQuestions, editQuestion, cancelQuestion } = setupWithQuestions(3);
            editQuestion('question-2');

            cancelQuestion('question-2');

            expect(savedQuestions.value.map((question) => question.id)).toEqual(['question-1', 'question-2', 'question-3']);
        });
    });

    describe('removeQuestion', () => {
        it('removes question by id', () => {
            const { savedQuestions, removeQuestion } = setupWithQuestions(2);

            removeQuestion('question-1');

            expect(savedQuestions.value.map((question) => question.id)).toEqual(['question-2']);
        });

        it('removes edited question', () => {
            const {
                isEditing,
                savedCount,
                editQuestion,
                removeQuestion,
            } = setupWithQuestions(2);
            editQuestion('question-1');

            removeQuestion('question-1');

            expect(isEditing.value).toBe(false);
            expect(savedCount.value).toBe(1);
        });
    });

    describe('buildTestPayload', () => {
        it('collects fields and saved questions only', () => {
            const {
                title,
                description,
                attempts,
                addQuestion,
                buildTestPayload,
            } = setupWithQuestions(1);
            title.value = 'География';
            description.value = 'Столицы мира';
            attempts.value = 3;
            addQuestion();

            expect(buildTestPayload()).toEqual(makeTestPayload({
                title: 'География',
                description: 'Столицы мира',
                attempts: 3,
                questions: [makeTestQuestion({ isSaved: true })],
            }));
        });

        it('returns copies of questions', () => {
            const { savedQuestions, buildTestPayload } = setupWithQuestions(1);
            const payload = buildTestPayload();

            payload.questions[0].text = 'Изменено в payload';
            payload.questions[0].answers[0].text = 'Изменено в payload';

            expect(savedQuestions.value[0].text).toBe('Сколько будет 2 + 2?');
            expect(savedQuestions.value[0].answers[0].text).toBe('4');
        });
    });

    describe('applyTestPayload', () => {
        it('fills fields and marks questions as saved', () => {
            const {
                title,
                description,
                attempts,
                savedQuestions,
                applyTestPayload,
            } = useTestBuilder();

            applyTestPayload(makeTestPayload({ title: 'География', description: 'Столицы мира', attempts: 3 }));

            expect(title.value).toBe('География');
            expect(description.value).toBe('Столицы мира');
            expect(attempts.value).toBe(3);
            expect(savedQuestions.value).toEqual([makeTestQuestion({ isSaved: true })]);
        });

        it('replaces question that was being edited', () => {
            const {
                isEditing,
                savedCount,
                addQuestion,
                applyTestPayload,
            } = useTestBuilder();
            addQuestion();

            applyTestPayload(makeTestPayload());

            expect(isEditing.value).toBe(false);
            expect(savedCount.value).toBe(1);
        });

        it('does not share question objects with payload', () => {
            const { savedQuestions, applyTestPayload } = useTestBuilder();
            const payload = makeTestPayload();

            applyTestPayload(payload);
            payload.questions[0].answers[0].text = 'Изменено в payload';

            expect(savedQuestions.value[0].answers[0].text).toBe('4');
        });
    });

    describe('savedCountLabel', () => {
        it.each([
            [1, '1 вопрос'],
            [2, '2 вопроса'],
            [4, '4 вопроса'],
            [5, '5 вопросов'],
            [11, '11 вопросов'],
            [12, '12 вопросов'],
            [14, '14 вопросов'],
            [21, '21 вопрос'],
            [22, '22 вопроса'],
            [25, '25 вопросов'],
            [101, '101 вопрос'],
            [111, '111 вопросов'],
            [112, '112 вопросов'],
        ])('declines word for %i questions', (count, label) => {
            const { savedCountLabel } = setupWithQuestions(count);

            expect(savedCountLabel.value).toBe(label);
        });

        it('counts only saved questions', () => {
            const { savedCountLabel, editQuestion } = setupWithQuestions(2);

            editQuestion('question-1');

            expect(savedCountLabel.value).toBe('1 вопрос');
        });
    });
});
