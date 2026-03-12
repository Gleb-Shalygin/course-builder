import { computed, Ref } from 'vue';
import { TestTableItem } from '@/types/TestTableItem';

export function useTestItem(test: Ref<TestTableItem>) {
    const title = computed(() => test.value.title);
    const description = computed(() => test.value.description);
    const countFinished = computed(() => test.value.count_finished);
    const isCountFinished = computed(() => countFinished.value > 0);

    return {
        title,
        description,
        countFinished,
        isCountFinished,
    };
}
