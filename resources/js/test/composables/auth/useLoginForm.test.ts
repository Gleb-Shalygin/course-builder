import { router } from '@inertiajs/vue3';
import { authService } from '@/api/auth';
import { useLoginForm } from '@/composables/auth/useLoginForm';
import { makeAxiosError } from '@/test/helpers/makeAxiosError';
import type { LoginCredentials } from '@/types/auth/LoginCredentials';

vi.mock('@/api/auth', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/api/auth')>();

    return {
        ...original,
        authService: {
            ...original.authService,
            login: vi.fn(),
        },
    };
});

vi.mock('@inertiajs/vue3', () => ({
    router: {
        visit: vi.fn(),
    },
    usePage: () => ({
        props: {
            auth: {
                user: null,
            },
        },
    }),
}));

const CREDENTIALS: LoginCredentials = {
    email: 'ivan@example.com',
    password: 'Secret123',
    remember: true,
};

const LOGIN_ERROR = makeAxiosError({
    message: 'Неверный логин или пароль.',
    errors: { email: ['Неверный логин или пароль.'] },
});

describe('useLoginForm', () => {
    function setup() {
        const loginForm = useLoginForm();
        Object.assign(loginForm.form, CREDENTIALS);

        return loginForm;
    }

    beforeEach(() => {
        vi.mocked(authService.login).mockResolvedValue();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('starts with empty form', () => {
        const { form, errors, errorMessage } = useLoginForm();

        expect(form).toEqual({ email: '', password: '', remember: false });
        expect(errors.value).toEqual({});
        expect(errorMessage.value).toBe('');
    });

    it('logs in with form data and opens profile', async () => {
        const { handleSubmit } = setup();

        await handleSubmit();

        expect(authService.login).toHaveBeenCalledWith(CREDENTIALS);
        expect(router.visit).toHaveBeenCalledWith('/profile');
    });

    it('shows backend errors', async () => {
        vi.mocked(authService.login).mockRejectedValue(LOGIN_ERROR);
        const { errors, errorMessage, handleSubmit } = setup();

        await handleSubmit();

        expect(errors.value).toEqual({ email: ['Неверный логин или пароль.'] });
        expect(errorMessage.value).toBe('Неверный логин или пароль.');
        expect(router.visit).not.toHaveBeenCalled();
    });

    it('resets previous backend errors before next submit', async () => {
        vi.mocked(authService.login).mockRejectedValueOnce(LOGIN_ERROR);
        const { errors, errorMessage, handleSubmit } = setup();
        await handleSubmit();

        await handleSubmit();

        expect(errors.value).toEqual({});
        expect(errorMessage.value).toBe('');
    });
});
