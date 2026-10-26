import { router } from '@inertiajs/vue3';
import { authService } from '@/api/auth';
import { useRegisterForm } from '@/composables/auth/useRegisterForm';
import { makeAxiosError } from '@/test/helpers/makeAxiosError';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';
import type { RegisterData } from '@/types/auth/RegisterData';

vi.mock('@/api/auth', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/api/auth')>();

    return {
        ...original,
        authService: {
            ...original.authService,
            register: vi.fn(),
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

const VALID_FORM: RegisterData = {
    email: 'ivan@example.com',
    name: 'ivan',
    password: 'Secret123',
    password_confirmation: 'Secret123',
    date_of_birth: '2000-01-01',
    gender: 'male',
};

const REQUIREMENTS_ERROR = 'Пароль не соответствует требованиям';
const MISMATCH_ERROR = 'Пароли не совпадают';

describe('useRegisterForm', () => {
    function setup(overrides: Partial<RegisterData> = {}) {
        const registerForm = useRegisterForm();
        Object.assign(registerForm.form, VALID_FORM, overrides);

        return registerForm;
    }

    beforeEach(() => {
        vi.mocked(authService.register).mockResolvedValue(makeAxiosResponse({}));
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('validatePassword', () => {
        it('skips check for empty password', () => {
            const { passwordError, validatePassword } = setup({ password: '' });

            validatePassword();

            expect(passwordError.value).toBe('');
        });

        it('flags password that misses requirements', () => {
            const { passwordError, validatePassword } = setup({ password: 'secret' });

            validatePassword();

            expect(passwordError.value).toBe(REQUIREMENTS_ERROR);
        });

        it('clears error once password meets requirements', () => {
            const { form, passwordError, validatePassword } = setup({ password: 'secret' });
            validatePassword();

            form.password = 'Secret123';
            validatePassword();

            expect(passwordError.value).toBe('');
        });
    });

    describe('validatePasswordConfirmation', () => {
        it('skips check for empty confirmation', () => {
            const { passwordConfirmationError, validatePasswordConfirmation } = setup({ password_confirmation: '' });

            validatePasswordConfirmation();

            expect(passwordConfirmationError.value).toBe('');
        });

        it('flags mismatch on both password fields', () => {
            const {
                passwordError,
                passwordConfirmationError,
                validatePasswordConfirmation,
            } = setup({ password_confirmation: 'Secret124' });

            validatePasswordConfirmation();

            expect(passwordConfirmationError.value).toBe(MISMATCH_ERROR);
            expect(passwordError.value).toBe(MISMATCH_ERROR);
        });

        it('clears mismatch error once passwords match', () => {
            const {
                form,
                passwordError,
                passwordConfirmationError,
                validatePasswordConfirmation,
            } = setup({ password_confirmation: 'Secret124' });
            validatePasswordConfirmation();

            form.password_confirmation = 'Secret123';
            validatePasswordConfirmation();

            expect(passwordConfirmationError.value).toBe('');
            expect(passwordError.value).toBe('');
        });

        it('keeps requirements error when passwords match', () => {
            const {
                passwordError,
                validatePassword,
                validatePasswordConfirmation,
            } = setup({ password: 'secret', password_confirmation: 'secret' });
            validatePassword();

            validatePasswordConfirmation();

            expect(passwordError.value).toBe(REQUIREMENTS_ERROR);
        });
    });

    describe('handleSubmit', () => {
        it('registers user with form data and opens profile', async () => {
            const { handleSubmit } = setup();

            await handleSubmit();

            expect(authService.register).toHaveBeenCalledWith(VALID_FORM);
            expect(router.visit).toHaveBeenCalledWith('/profile');
        });

        it('does not send password that misses requirements', async () => {
            const { passwordError, handleSubmit } = setup({ password: 'secret', password_confirmation: 'secret' });

            await handleSubmit();

            expect(authService.register).not.toHaveBeenCalled();
            expect(passwordError.value).toBe(REQUIREMENTS_ERROR);
        });

        it('does not send mismatched passwords', async () => {
            const { passwordConfirmationError, handleSubmit } = setup({ password_confirmation: 'Secret124' });

            await handleSubmit();

            expect(authService.register).not.toHaveBeenCalled();
            expect(passwordConfirmationError.value).toBe(MISMATCH_ERROR);
        });

        it('shows backend validation errors', async () => {
            vi.mocked(authService.register).mockRejectedValue(makeAxiosError({
                message: 'Такой email уже занят.',
                errors: { email: ['Такой email уже занят.'] },
            }));
            const { errors, errorMessage, handleSubmit } = setup();

            await handleSubmit();

            expect(errors.value).toEqual({ email: ['Такой email уже занят.'] });
            expect(errorMessage.value).toBe('Такой email уже занят.');
            expect(router.visit).not.toHaveBeenCalled();
        });

        it('resets previous backend errors before next submit', async () => {
            vi.mocked(authService.register).mockRejectedValueOnce(makeAxiosError({
                message: 'Такой email уже занят.',
                errors: { email: ['Такой email уже занят.'] },
            }));
            const { errors, errorMessage, handleSubmit } = setup();
            await handleSubmit();

            await handleSubmit();

            expect(errors.value).toEqual({});
            expect(errorMessage.value).toBe('');
        });
    });
});
