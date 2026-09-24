import { router } from '@inertiajs/vue3';

export function useTestsNavigation() {
    const goToTests = (): void => {
        router.visit('/profile/tests');
    };
    const goToTestCreate = (): void => {
        router.visit('/profile/test-create');
    };
    const goToTestEdit = (testId: number): void => {
        router.visit(`/profile/tests/${testId}/edit`);
    };

    return {
        goToTests,
        goToTestCreate,
        goToTestEdit,
    };
}
