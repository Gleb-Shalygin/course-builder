import api from '@/api/api';
import {
    createTestRequest,
    getTestRequest,
    getTestsRequest,
    updateTestRequest,
} from '@/api/test';
import { makeAnswerOption } from '@/test/helpers/makeAnswerOption';
import { makeTestPayload } from '@/test/helpers/makeTestPayload';
import { makeTestQuestion } from '@/test/helpers/makeTestQuestion';
import { QuestionType } from '@/types/tests/Test';
import type { TestCreateRequest } from '@/types/tests/Test';

vi.mock('@/api/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
    },
}));

const EXPECTED_REQUEST: TestCreateRequest = {
    title: 'Арифметика',
    description: null,
    attempts: 1,
    questions: [
        {
            id: null,
            type: QuestionType.Single,
            text: 'Сколько будет 2 + 2?',
            answers: [
                { id: null, text: '4', is_correct: true },
                { id: null, text: '5', is_correct: false },
            ],
        },
    ],
};

describe('api/test', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('getTestsRequest', () => {
        it('requests list of tests', () => {
            getTestsRequest();

            expect(api.get).toHaveBeenCalledWith('/api/tests');
        });
    });

    describe('getTestRequest', () => {
        it('requests test by id', () => {
            getTestRequest(5);

            expect(api.get).toHaveBeenCalledWith('/api/tests/5');
        });
    });

    describe('createTestRequest', () => {
        it('posts test in backend format', () => {
            createTestRequest(makeTestPayload());

            expect(api.post).toHaveBeenCalledWith('/api/tests', EXPECTED_REQUEST);
        });

        it('trims title, question and answer texts', () => {
            const payload = makeTestPayload({
                title: '  Арифметика  ',
                questions: [
                    makeTestQuestion({
                        text: '  Сколько будет 2 + 2?  ',
                        answers: [
                            makeAnswerOption({ text: ' 4 ', isCorrect: true }),
                            makeAnswerOption({ text: '5  ' }),
                        ],
                    }),
                ],
            });

            createTestRequest(payload);

            expect(api.post).toHaveBeenCalledWith('/api/tests', EXPECTED_REQUEST);
        });

        it('keeps description as is', () => {
            createTestRequest(makeTestPayload({ description: '  Устный счёт  ' }));

            expect(api.post).toHaveBeenCalledWith('/api/tests', { ...EXPECTED_REQUEST, description: '  Устный счёт  ' });
        });

        it('drops blank answers', () => {
            const payload = makeTestPayload({
                questions: [
                    makeTestQuestion({
                        answers: [
                            makeAnswerOption({ text: '4', isCorrect: true }),
                            makeAnswerOption({ text: '   ' }),
                            makeAnswerOption({ text: '5' }),
                        ],
                    }),
                ],
            });

            createTestRequest(payload);

            expect(api.post).toHaveBeenCalledWith('/api/tests', EXPECTED_REQUEST);
        });

        it('sends persisted ids of questions and answers', () => {
            const payload = makeTestPayload({
                questions: [
                    makeTestQuestion({
                        persistedId: 10,
                        answers: [
                            makeAnswerOption({ persistedId: 100, text: '4', isCorrect: true }),
                            makeAnswerOption({ text: '5' }),
                        ],
                    }),
                ],
            });

            createTestRequest(payload);

            expect(api.post).toHaveBeenCalledWith('/api/tests', {
                ...EXPECTED_REQUEST,
                questions: [
                    {
                        ...EXPECTED_REQUEST.questions[0],
                        id: 10,
                        answers: [
                            { id: 100, text: '4', is_correct: true },
                            { id: null, text: '5', is_correct: false },
                        ],
                    },
                ],
            });
        });
    });

    describe('updateTestRequest', () => {
        it('puts test in backend format by id', () => {
            updateTestRequest(5, makeTestPayload());

            expect(api.put).toHaveBeenCalledWith('/api/tests/5', EXPECTED_REQUEST);
        });
    });
});
