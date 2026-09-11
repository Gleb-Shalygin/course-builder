import api from '@/api/api';
import type { CreatedTest, TestPayload } from '@/types/Test';

export function getTestsRequest() {
    return api.get('/api/tests');
}

export function createTestRequest(payload: TestPayload) {
    return api.post<{ data: CreatedTest }>('/api/tests', payload);
}
