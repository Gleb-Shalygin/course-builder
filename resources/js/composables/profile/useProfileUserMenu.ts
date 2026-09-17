import { computed } from 'vue';
import { router } from '@inertiajs/vue3';
import { useAuth } from '@/composables/auth/useAuth';

export function useProfileUserMenu() {
    const { user, logout } = useAuth();

    const userName = computed((): string => user.value?.name ?? 'Пользователь');
    const userEmail = computed((): string => user.value?.email ?? '');
    const userInitials = computed((): string => userName.value.trim().charAt(0).toUpperCase());

    const goToProfile = (): void => {
        router.visit('/profile');
    };
    const handleLogout = async (): Promise<void> => {
        await logout();
    };

    return {
        userName,
        userEmail,
        userInitials,
        goToProfile,
        handleLogout,
    };
}
