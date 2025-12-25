import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService, type User, type LoginCredentials, type RegisterData, extractValidationErrors, extractErrorMessage, type ApiError } from '@/services/auth';

const user = ref<User | null>(null);
const loading = ref(false);
const initialized = ref(false);

export function useAuth() {
    const router = useRouter();

    /**
     * Инициализация - проверка текущего пользователя
     */
    async function init(): Promise<void> {
        if (initialized.value) return;

        // try {
        //     // const currentUser = await authService.getUser();
        //     // user.value = currentUser;
        // } catch (error) {
        //     user.value = null;
        // } finally {
        //     initialized.value = true;
        // }
    }

    /**
     * Авторизация
     */
    async function login(credentials: LoginCredentials): Promise<{
        success: boolean;
        errors?: Record<string, string[]>;
        message?: string;
    }> {
        loading.value = true;
        try {
            await authService.login(credentials);
            const currentUser = await authService.getUser();
            user.value = currentUser;
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
            loading.value = false;
        }
    }

    /**
     * Регистрация
     */
    async function register(data: RegisterData): Promise<{
        success: boolean;
        errors?: Record<string, string[]>;
        message?: string;
    }> {
        loading.value = true;
        try {
            await authService.register(data);
            // После регистрации автоматически авторизуем
            const currentUser = await authService.getUser();
            user.value = currentUser;
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
            loading.value = false;
        }
    }

    /**
     * Выход
     */
    async function logout(): Promise<void> {
        loading.value = true;
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            user.value = null;
            loading.value = false;
            await router.push('/login');
        }
    }

    /**
     * Проверка авторизации
     */
    async function checkAuth(): Promise<boolean> {
        try {
            const currentUser = await authService.getUser();
            user.value = currentUser;
            return !!currentUser;
        } catch (error) {
            user.value = null;
            return false;
        }
    }

    return {
        user: computed(() => user.value),
        isAuthenticated: computed(() => !!user.value),
        loading: computed(() => loading.value),
        initialized: computed(() => initialized.value),
        init,
        login,
        register,
        logout,
        checkAuth,
    };
}

