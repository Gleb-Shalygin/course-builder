import { useTestMapper } from '@/composables/tests/builder/useTestMapper';
import { makeTestDetail } from '@/test/helpers/makeTestDetail';
import { QuestionType } from '@/types/tests/Test';

describe('useTestMapper', () => {
    describe('toAnswer', () => {
        it('maps detail answer to editable answer option', () => {
            const { toAnswer } = useTestMapper();

            expect(toAnswer({ id: 100, text: '4', is_correct: true })).toEqual({
                id: '100',
                persistedId: 100,
                text: '4',
                isCorrect: true,
            });
        });
    });

    describe('toQuestion', () => {
        it('maps detail question as saved question with answers', () => {
            const { toQuestion } = useTestMapper();
            const question = {
                id: 10,
                type: QuestionType.TrueFalse,
                text: 'Земля круглая?',
                answers: [
                    { id: 100, text: 'Да', is_correct: true },
                    { id: 101, text: 'Нет', is_correct: false },
                ],
            };

            expect(toQuestion(question)).toEqual({
                id: '10',
                persistedId: 10,
                type: QuestionType.TrueFalse,
                text: 'Земля круглая?',
                answers: [
                    { id: '100', persistedId: 100, text: 'Да', isCorrect: true },
                    { id: '101', persistedId: 101, text: 'Нет', isCorrect: false },
                ],
                isSaved: true,
            });
        });
    });

    describe('toTestPayload', () => {
        it('maps test detail to editable payload without server-only fields', () => {
            const { toTestPayload } = useTestMapper();
            const detail = makeTestDetail({
                link: 'abc',
                description: 'Простые примеры',
                attempts: 3,
                is_public: true,
            });

            expect(toTestPayload(detail)).toEqual({
                title: 'Арифметика',
                description: 'Простые примеры',
                attempts: 3,
                questions: [
                    {
                        id: '10',
                        persistedId: 10,
                        type: QuestionType.Single,
                        text: 'Сколько будет 2 + 2?',
                        answers: [
                            { id: '100', persistedId: 100, text: '4', isCorrect: true },
                            { id: '101', persistedId: 101, text: '5', isCorrect: false },
                        ],
                        isSaved: true,
                    },
                ],
            });
        });

        it('keeps empty description as null', () => {
            const { toTestPayload } = useTestMapper();
            const detail = makeTestDetail({ description: null });

            expect(toTestPayload(detail)?.description).toBeNull();
        });

        it('maps test without questions to empty question list', () => {
            const { toTestPayload } = useTestMapper();
            const detail = makeTestDetail({ questions: [] });

            expect(toTestPayload(detail)?.questions).toEqual([]);
        });
    });
});
