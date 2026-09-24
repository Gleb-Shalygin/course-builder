import api from '@/api/api';
import type { CreatedTest, TestCreateRequest, TestDetail, TestPayload, TestQuestionRequest } from '@/types/tests/Test';

function toQuestionsRequest(payload: TestPayload): TestQuestionRequest[] {
    return payload.questions.map((question) => ({
        id: question.persistedId,
        type: question.type,
        text: question.text.trim(),
        answers: question.answers
            .filter((answer) => answer.text.trim() !== '')
            .map((answer) => ({
                id: answer.persistedId,
                text: answer.text.trim(),
                is_correct: answer.isCorrect,
            })),
    }));
}

function toTestRequest(payload: TestPayload): TestCreateRequest {
    return {
        title: payload.title.trim(),
        description: payload.description,
        attempts: payload.attempts,
        questions: toQuestionsRequest(payload),
    };
}

export function getTestsRequest() {
    return api.get('/api/tests');
}

export function getTestRequest(testId: number) {
    return api.get<TestDetail>(`/api/tests/${testId}`);
}

export function createTestRequest(payload: TestPayload) {
    return api.post<CreatedTest>('/api/tests', toTestRequest(payload));
}

export function updateTestRequest(testId: number, payload: TestPayload) {
    return api.put<CreatedTest>(`/api/tests/${testId}`, toTestRequest(payload));
}
