import api, { type ApiError } from './api';
import { csrfCookie } from '@/routes/sanctum';
import { LoginCredentials } from '@/types/LoginCredentials';
import { RegisterData } from '@/types/RegisterData';
import { User } from '@/types/User';


export const authService = {
    async getCsrfCookie(): Promise<void> {
        await api.get(csrfCookie.url());
    },

    async login(credentials: LoginCredentials): Promise<void> {
        await this.getCsrfCookie();
        await api.post('/api/login', credentials);
    },

    register(data: RegisterData) {
        return api.post('/api/register', data);
    },

    async logout(): Promise<void> {
        await api.post('/api/logout');
    },

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

