import { computed } from 'vue';
import type { Ref } from 'vue';
import { useTestsNavigation } from '@/composables/tests/useTestsNavigation';
import type { TestTableItem } from '@/types/TestTableItem';

export function useTestItem(test: Ref<TestTableItem>) {
    const { goToTestEdit } = useTestsNavigation();

    const title = computed((): string => test.value.title);
    const description = computed((): string => test.value.description);
    const attempts = computed((): number => test.value.attempts);
    const countFinished = computed((): number => test.value.count_finished);

    async function handleEdit(): Promise<void> {
        await goToTestEdit(test.value.id);
    }

    return {
        title,
        description,
        attempts,
        countFinished,
        handleEdit,
    };
}
