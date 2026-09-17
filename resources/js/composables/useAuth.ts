import { computed, ref } from 'vue';
import { router, usePage } from '@inertiajs/vue3';
import type { User } from '@/types/User';
import type { AppPageProps } from '@/types/PageProps';
import type { LoginCredentials } from '@/types/LoginCredentials';
import type { RegisterData } from '@/types/RegisterData';
import type { AuthResult } from '@/types/AuthResult';
import { authService, extractValidationErrors, extractErrorMessage, type ApiError } from '@/api/auth';

const loading = ref(false);

export function useAuth() {
    const page = usePage<AppPageProps>();

    const user = computed((): User | null => page.props.auth.user);
    const isAuthenticated = computed((): boolean => user.value !== null);

    const toFailure = (error: unknown): AuthResult => {
        const apiError = error as ApiError;

        return {
            success: false,
            errors: extractValidationErrors(apiError),
            message: extractErrorMessage(apiError),
        };
    };

    const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
        loading.value = true;
        try {
            await authService.login(credentials);
            router.visit('/profile');

            return { success: true };
        } catch (error) {
            return toFailure(error);
        } finally {
            loading.value = false;
        }
    };

    const register = async (data: RegisterData): Promise<AuthResult> => {
        loading.value = true;
        try {
            await authService.register(data);
            router.visit('/profile');

            return { success: true };
        } catch (error) {
            return toFailure(error);
        } finally {
            loading.value = false;
        }
    };

    const logout = async (): Promise<void> => {
        loading.value = true;
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            loading.value = false;
            router.visit('/login');
        }
    };

    return {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
    };
}
