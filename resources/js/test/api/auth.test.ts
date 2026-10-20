import { AxiosError } from 'axios';
import api from '@/api/api';
import type { ApiError } from '@/api/api';
import { authService, extractErrorMessage, extractValidationErrors } from '@/api/auth';
import { makeAxiosError } from '@/test/helpers/makeAxiosError';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';
import type { LoginCredentials } from '@/types/auth/LoginCredentials';
import type { RegisterData } from '@/types/auth/RegisterData';
import type { User } from '@/types/auth/User';

vi.mock('@/api/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const CREDENTIALS: LoginCredentials = {
    email: 'ivan@example.com',
    password: 'Secret123',
    remember: true,
};

const REGISTER_DATA: RegisterData = {
    email: 'ivan@example.com',
    name: 'ivan',
    password: 'Secret123',
    password_confirmation: 'Secret123',
    date_of_birth: '2000-01-01',
    gender: 'male',
};

const USER: User = {
    id: 1,
    name: 'ivan',
    email: 'ivan@example.com',
};

describe('api/auth', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('authService', () => {
        it('requests csrf cookie before login', async () => {
            vi.mocked(api.get).mockResolvedValue(makeAxiosResponse({}));
            vi.mocked(api.post).mockResolvedValue(makeAxiosResponse({}));

            await authService.login(CREDENTIALS);

            expect(api.get).toHaveBeenCalledWith('/sanctum/csrf-cookie');
            expect(api.post).toHaveBeenCalledWith('/api/login', CREDENTIALS);
            expect(vi.mocked(api.get).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(api.post).mock.invocationCallOrder[0]);
        });

        it('does not send credentials when csrf cookie request fails', async () => {
            vi.mocked(api.get).mockRejectedValue(new Error('Network down'));

            await expect(authService.login(CREDENTIALS)).rejects.toThrow('Network down');

            expect(api.post).not.toHaveBeenCalled();
        });

        it('posts registration data', async () => {
            vi.mocked(api.post).mockResolvedValue(makeAxiosResponse({}));

            await authService.register(REGISTER_DATA);

            expect(api.post).toHaveBeenCalledWith('/api/register', REGISTER_DATA);
        });

        it('posts logout', async () => {
            vi.mocked(api.post).mockResolvedValue(makeAxiosResponse({}));

            await authService.logout();

            expect(api.post).toHaveBeenCalledWith('/api/logout');
        });

        it('returns current user', async () => {
            vi.mocked(api.get).mockResolvedValue(makeAxiosResponse(USER));

            const user = await authService.getUser();

            expect(api.get).toHaveBeenCalledWith('/api/user');
            expect(user).toEqual(USER);
        });

        it('returns null when user request fails', async () => {
            vi.mocked(api.get).mockRejectedValue(makeAxiosError({ message: 'Unauthenticated.' }, 401));

            const user = await authService.getUser();

            expect(user).toBeNull();
        });
    });

    describe('extractValidationErrors', () => {
        it('returns field errors from response', () => {
            const error = makeAxiosError({ errors: { email: ['Такой email уже занят.'] } });

            expect(extractValidationErrors(error)).toEqual({ email: ['Такой email уже занят.'] });
        });

        it('returns empty object when response has no field errors', () => {
            const error = makeAxiosError({ message: 'Ошибка сервера' }, 500);

            expect(extractValidationErrors(error)).toEqual({});
        });

        it('returns empty object when there is no response', () => {
            const error: ApiError = new AxiosError('Network Error');

            expect(extractValidationErrors(error)).toEqual({});
        });
    });

    describe('extractErrorMessage', () => {
        it('returns server message', () => {
            const error = makeAxiosError({
                message: 'Неверный логин или пароль.',
                errors: { email: ['Такой email уже занят.'] },
            });

            expect(extractErrorMessage(error)).toBe('Неверный логин или пароль.');
        });

        it('returns first field error when server message is missing', () => {
            const error = makeAxiosError({
                errors: {
                    email: ['Такой email уже занят.', 'Email слишком длинный.'],
                    name: ['Логин уже занят.'],
                },
            });

            expect(extractErrorMessage(error)).toBe('Такой email уже занят.');
        });

        it('skips empty list of field errors', () => {
            const error = makeAxiosError({ errors: { email: [] } });

            expect(extractErrorMessage(error)).toBe('Request failed');
        });

        it('returns error message when there is no response', () => {
            const error: ApiError = new AxiosError('Network Error');

            expect(extractErrorMessage(error)).toBe('Network Error');
        });

        it('returns default message when error has no text', () => {
            const error: ApiError = new AxiosError('');

            expect(extractErrorMessage(error)).toBe('Произошла ошибка');
        });
    });
});
