import { router } from '@inertiajs/vue3';
import { authService } from '@/api/auth';
import { useAuth } from '@/composables/auth/useAuth';
import { makeAxiosError } from '@/test/helpers/makeAxiosError';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';
import type { LoginCredentials } from '@/types/auth/LoginCredentials';
import type { RegisterData } from '@/types/auth/RegisterData';
import type { User } from '@/types/auth/User';
import type { AppPageProps } from '@/types/PageProps';

const page = vi.hoisted((): { props: AppPageProps } => ({
    props: {
        auth: {
            user: null,
        },
    },
}));

vi.mock('@/api/auth', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/api/auth')>();

    return {
        ...original,
        authService: {
            ...original.authService,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
        },
    };
});

vi.mock('@inertiajs/vue3', () => ({
    router: {
        visit: vi.fn(),
    },
    usePage: () => page,
}));

const USER: User = {
    id: 1,
    name: 'ivan',
    email: 'ivan@example.com',
};

const CREDENTIALS: LoginCredentials = {
    email: 'ivan@example.com',
    password: 'Secret123',
    remember: false,
};

const REGISTER_DATA: RegisterData = {
    email: 'ivan@example.com',
    name: 'ivan',
    password: 'Secret123',
    password_confirmation: 'Secret123',
    date_of_birth: '2000-01-01',
    gender: 'male',
};

const VALIDATION_ERROR = makeAxiosError({
    message: 'Неверный логин или пароль.',
    errors: { email: ['Неверный логин или пароль.'] },
});

describe('useAuth', () => {
    beforeEach(() => {
        page.props.auth.user = null;
        vi.mocked(authService.login).mockResolvedValue();
        vi.mocked(authService.register).mockResolvedValue(makeAxiosResponse({}));
        vi.mocked(authService.logout).mockResolvedValue();
    });

    afterEach(() => {
        vi.resetAllMocks();
        vi.restoreAllMocks();
    });

    describe('user', () => {
        it('is empty for guest', () => {
            const { user, isAuthenticated } = useAuth();

            expect(user.value).toBeNull();
            expect(isAuthenticated.value).toBe(false);
        });

        it('takes user from page props', () => {
            page.props.auth.user = USER;

            const { user, isAuthenticated } = useAuth();

            expect(user.value).toEqual(USER);
            expect(isAuthenticated.value).toBe(true);
        });
    });

    describe('login', () => {
        it('logs in and opens profile', async () => {
            const { login } = useAuth();

            const result = await login(CREDENTIALS);

            expect(authService.login).toHaveBeenCalledWith(CREDENTIALS);
            expect(router.visit).toHaveBeenCalledWith('/profile');
            expect(result).toEqual({ success: true });
        });

        it('returns backend errors on failure', async () => {
            vi.mocked(authService.login).mockRejectedValue(VALIDATION_ERROR);
            const { login } = useAuth();

            const result = await login(CREDENTIALS);

            expect(result).toEqual({
                success: false,
                errors: { email: ['Неверный логин или пароль.'] },
                message: 'Неверный логин или пароль.',
            });
            expect(router.visit).not.toHaveBeenCalled();
        });

        it('shows loading while request is pending', async () => {
            const request = Promise.withResolvers<void>();
            vi.mocked(authService.login).mockReturnValue(request.promise);
            const { loading, login } = useAuth();

            const pending = login(CREDENTIALS);

            expect(loading.value).toBe(true);

            request.resolve();
            await pending;

            expect(loading.value).toBe(false);
        });

        it('resets loading after failure', async () => {
            vi.mocked(authService.login).mockRejectedValue(VALIDATION_ERROR);
            const { loading, login } = useAuth();

            await login(CREDENTIALS);

            expect(loading.value).toBe(false);
        });

        it('shares loading between instances', async () => {
            const request = Promise.withResolvers<void>();
            vi.mocked(authService.login).mockReturnValue(request.promise);
            const first = useAuth();
            const second = useAuth();

            const pending = first.login(CREDENTIALS);

            expect(second.loading.value).toBe(true);

            request.resolve();
            await pending;
        });
    });

    describe('register', () => {
        it('registers and opens profile', async () => {
            const { register } = useAuth();

            const result = await register(REGISTER_DATA);

            expect(authService.register).toHaveBeenCalledWith(REGISTER_DATA);
            expect(router.visit).toHaveBeenCalledWith('/profile');
            expect(result).toEqual({ success: true });
        });

        it('returns backend errors on failure', async () => {
            vi.mocked(authService.register).mockRejectedValue(makeAxiosError({
                message: 'Такой email уже занят.',
                errors: { email: ['Такой email уже занят.'] },
            }));
            const { loading, register } = useAuth();

            const result = await register(REGISTER_DATA);

            expect(result).toEqual({
                success: false,
                errors: { email: ['Такой email уже занят.'] },
                message: 'Такой email уже занят.',
            });
            expect(router.visit).not.toHaveBeenCalled();
            expect(loading.value).toBe(false);
        });
    });

    describe('logout', () => {
        it('logs out and opens login page', async () => {
            const { logout } = useAuth();

            await logout();

            expect(authService.logout).toHaveBeenCalled();
            expect(router.visit).toHaveBeenCalledWith('/login');
        });

        it('opens login page even when request fails', async () => {
            const error = new Error('Network down');
            vi.mocked(authService.logout).mockRejectedValue(error);
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const { loading, logout } = useAuth();

            await logout();

            expect(router.visit).toHaveBeenCalledWith('/login');
            expect(consoleError).toHaveBeenCalledWith('Logout error:', error);
            expect(loading.value).toBe(false);
        });
    });
});
