import { computed, Ref } from 'vue';
import { useRouter } from 'vue-router';
import { TestTableItem } from '@/types/TestTableItem';

export function useTestItem(test: Ref<TestTableItem>) {
    const router = useRouter();

    const title = computed(() => test.value.title);
    const description = computed(() => test.value.description);
    const attempts = computed(() => test.value.attempts);
    const countFinished = computed(() => test.value.count_finished);

    function handleEdit() {
        router.push({ name: 'test-edit', params: { id: test.value.id } });
    }

    return {
        title,
        description,
        attempts,
        countFinished,
        handleEdit,
    };
}
