import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import { useRoute } from 'vue-router';

export function useRunnerRouteLink(): { testLink: ComputedRef<string | null>; testKey: ComputedRef<string> } {
    const route = useRoute();

    const routeLink = computed((): string => String(route.params.id ?? ''));
    const testLink = computed((): string | null => (routeLink.value === '' ? null : routeLink.value));
    const testKey = computed((): string => `test-${routeLink.value}`);

    return {
        testLink,
        testKey,
    };
}
