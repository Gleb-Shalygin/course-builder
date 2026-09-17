import { computed } from 'vue';
import type { Ref } from 'vue';

type UpdateDescriptionEmit = (event: 'update:description', description: string) => void;

export function useTestDescriptionField(description: Ref<string | null>, emit: UpdateDescriptionEmit) {
    const descriptionValue = computed((): string => description.value ?? '');

    const handleDescription = (value: string): void => {
        emit('update:description', value);
    };

    return {
        descriptionValue,
        handleDescription,
    };
}
