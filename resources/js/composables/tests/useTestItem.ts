import { computed } from 'vue';
import type { Ref } from 'vue';
import { useTestLink } from '@/composables/tests/useTestLink';
import { useTestsNavigation } from '@/composables/tests/useTestsNavigation';
import type { TestTableItem } from '@/types/TestTableItem';

export function useTestItem(test: Ref<TestTableItem>) {
    const { goToTestEdit } = useTestsNavigation();

    const title = computed((): string => test.value.title);
    const description = computed((): string => test.value.description);
    const attempts = computed((): number => test.value.attempts);
    const countFinished = computed((): number => test.value.count_finished);
    const link = computed((): string | null => test.value.link);

    const { isLinkAvailable, isTouch, shareLink } = useTestLink(link);

    const isShareDisabled = computed((): boolean => !isLinkAvailable.value);

    const handleEdit = (): void => {
        goToTestEdit(test.value.id);
    };
    const handleShare = async (): Promise<void> => {
        await shareLink(title.value);
    };

    return {
        title,
        description,
        attempts,
        countFinished,
        isShareDisabled,
        isTouch,
        handleEdit,
        handleShare,
    };
}
