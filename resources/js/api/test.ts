import api from '@/api/api';
import type { CreatedTest, TestCreateRequest, TestPayload, TestQuestionRequest } from '@/types/Test';

function toQuestionsRequest(payload: TestPayload): TestQuestionRequest[] {
    return payload.questions.map((question) => ({
        type: question.type,
        text: question.text.trim(),
        answers: question.answers
            .filter((answer) => answer.text.trim() !== '')
            .map((answer) => ({
                text: answer.text.trim(),
                is_correct: answer.isCorrect,
            })),
    }));
}

export function getTestsRequest() {
    return api.get('/api/tests');
}

export function createTestRequest(payload: TestPayload) {
    const body: TestCreateRequest = {
        title: payload.title.trim(),
        attempts: payload.attempts,
        questions: toQuestionsRequest(payload),
    };

    return api.post<CreatedTest>('/api/tests', body);
}
