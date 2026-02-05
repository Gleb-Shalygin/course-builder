import { computed } from 'vue';
import { useRouter } from 'vue-router';
import User from './../types/User';
import LoginCredentials from './../types/LoginCredentials';
import RegisterData from './../types/RegisterData';
import { authService, extractValidationErrors, extractErrorMessage, type ApiError } from '@/api/auth';
import { useUserStore } from '@/store/userStore';


export function useAuth() {
    const router = useRouter();

    const userStore = useUserStore();

    const initialized = computed(() => userStore.initialized);
    const loading = computed(() => userStore.loading);
    const isAuthenticated = computed(() => userStore.isAuthenticated);
    const user = computed(() => userStore.user);

    async function login(credentials: LoginCredentials): Promise<{
        success: boolean;
        errors?: Record<string, string[]>;
        message?: string;
    }> {
        userStore.loading = true;
        try {
            await authService.login(credentials);
            const currentUser = await authService.getUser();

            if (currentUser) {
                userStore.user = currentUser;
            } else {
                userStore.setEmptyUser();
            }

            await router.push('/profile');
            return { success: true };
        } catch (error) {
            const apiError = error as ApiError;
            return {
                success: false,
                errors: extractValidationErrors(apiError),
                message: extractErrorMessage(apiError),
            };
        } finally {
            userStore.loading = false;
        }
    }

    async function register(data: RegisterData): Promise<{
        success: boolean;
        errors?: Record<string, string[]>;
        message?: string;
    }> {
        userStore.loading = true;
        try {
            await authService.register(data);
            // После регистрации автоматически авторизуем
            const currentUser = await authService.getUser();

            if (currentUser) {
                userStore.user = currentUser;
            } else {
                userStore.setEmptyUser();
            }

            await router.push('/profile');
            return { success: true };
        } catch (error) {
            const apiError = error as ApiError;
            return {
                success: false,
                errors: extractValidationErrors(apiError),
                message: extractErrorMessage(apiError),
            };
        } finally {
            userStore.loading = false;
        }
    }

    async function logout(): Promise<void> {
        userStore.loading = true;
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            userStore.setEmptyUser();
            userStore.loading = false;
            await router.push('/login');
        }
    }

    return {
        user,
        isAuthenticated,
        loading,
        initialized,
        login,
        register,
        logout,
    };
}

