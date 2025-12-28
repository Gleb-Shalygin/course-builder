import api, { type ApiError } from './api';
import { csrfCookie } from '@/routes/sanctum';

export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface RegisterData {
    email: string;
    name: string;
    password: string;
    password_confirmation: string;
    date_of_birth: string;
    gender: 'male' | 'female';
}

export interface User {
    id: number;
    name: string;
    email: string;
    date_of_birth?: string;
    gender?: 'male' | 'female';
}

export const authService = {
    /**
     * Получить CSRF cookie перед запросами
     */
    async getCsrfCookie(): Promise<void> {
        await api.get(csrfCookie.url());
    },

    /**
     * Авторизация пользователя
     */
    async login(credentials: LoginCredentials): Promise<void> {
        await this.getCsrfCookie();
        await api.post('/api/login', credentials);
    },

    register(data: RegisterData) {
        return api.post('/api/register', data);
    },

    /**
     * Выход из системы
     */
    async logout(): Promise<void> {
        await api.post('/api/logout');
    },

    /**
     * Получить текущего пользователя
     */
    async getUser(): Promise<User | null> {
        try {
            const response = await api.get('/api/user');
            return response.data;
        } catch (error) {
            return null;
        }
    },
};

export function extractValidationErrors(error: ApiError): Record<string, string[]> {
    if (error.response?.data?.errors) {
        return error.response.data.errors;
    }
    return {};
}

export function extractErrorMessage(error: ApiError): string {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
            return firstError[0];
        }
    }
    return error.message || 'Произошла ошибка';
}

