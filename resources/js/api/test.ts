import api from '@/api/api';

export function getTestsRequest() {
    return api.get('/api/tests');
}
