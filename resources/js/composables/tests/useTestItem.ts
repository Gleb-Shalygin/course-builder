import { computed, Ref } from 'vue';
import { TestTableItem } from '@/types/TestTableItem';

export function useTestItem(test: Ref<TestTableItem>) {
    const title = computed(() => test.value.title);
    const description = computed(() => test.value.description);

    return {
        title,
        description,
    };
}
