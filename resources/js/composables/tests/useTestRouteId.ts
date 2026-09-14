import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import { useRoute } from 'vue-router';

export function useTestRouteId(): { testId: ComputedRef<number | null>; testKey: ComputedRef<string> } {
    const route = useRoute();

    const routeId = computed((): string => String(route.params.id ?? ''));
    const testId = computed((): number | null => {
        const parsed = Number(routeId.value);

        if (!Number.isInteger(parsed) || parsed <= 0) return null;

        return parsed;
    });
    const testKey = computed((): string => `test-${routeId.value}`);

    return {
        testId,
        testKey,
    };
}
