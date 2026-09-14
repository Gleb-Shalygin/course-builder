import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

export function useProfileUserMenu() {
    const router = useRouter();

    const { user, logout } = useAuth();

    const userName = computed((): string => user.value.name ?? 'Пользователь');
    const userEmail = computed((): string => user.value.email ?? '');
    const userInitials = computed((): string => userName.value.trim().charAt(0).toUpperCase());

    function goToProfile(): void {
        router.push({ name: 'profile' });
    }

    async function handleLogout(): Promise<void> {
        await logout();
    }

    return {
        userName,
        userEmail,
        userInitials,
        goToProfile,
        handleLogout,
    };
}
