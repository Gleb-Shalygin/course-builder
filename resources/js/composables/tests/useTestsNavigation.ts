import { useRouter } from 'vue-router';

export function useTestsNavigation() {
    const router = useRouter();

    async function goToTests(): Promise<void> {
        await router.push({ name: 'profile-tests' });
    }
    async function goToTestCreate(): Promise<void> {
        await router.push({ name: 'test-create' });
    }
    async function goToTestEdit(testId: number): Promise<void> {
        await router.push({ name: 'test-edit', params: { id: testId } });
    }

    return {
        goToTests,
        goToTestCreate,
        goToTestEdit,
    };
}
