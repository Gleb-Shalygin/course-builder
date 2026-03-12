import { onMounted, ref } from 'vue';
import { getTestsRequest } from '@/api/test';

export function useTableTests() {
    const tests = ref(null);

    const getTests = () => {
        getTestsRequest()
            .then(({ data })=> tests.value = data.data);
    };

    onMounted(() => getTests());

    return {
        tests,
    };
}
