import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import type { Dayjs } from 'dayjs';
import { useAuthRules } from '@/composables/useAuthRules';

export function useRegisterForm() {
    const router = useRouter();
    const { register, isAuthenticated, loading } = useAuth();

    const form = reactive({
        email: '',
        name: '',
        password: '',
        password_confirmation: '',
        date_of_birth: null as Dayjs | null,
        gender: undefined as 'male' | 'female' | undefined,
    });

    const { rules, passwordRequirements } = useAuthRules(form);

    const errors = ref<Record<string, string[]>>({});
    const errorMessage = ref('');
    const passwordError = ref('');
    const passwordConfirmationError = ref('');

    const validatePassword = () => {
        passwordError.value = '';

        if (!form.password) return;

        if (passwordRequirements.value.some(req => !req.met)) {
            passwordError.value = 'Пароль не соответствует требованиям';
        }
    };

    const validatePasswordConfirmation = () => {
        passwordConfirmationError.value = '';

        if (!form.password_confirmation) return;

        if (form.password !== form.password_confirmation) {
            passwordConfirmationError.value = 'Пароли не совпадают';
            passwordError.value = 'Пароли не совпадают';
        } else {
            passwordError.value = '';
        }
    };

    const handleSubmit = async () => {
        errors.value = {};
        errorMessage.value = '';
        passwordError.value = '';
        passwordConfirmationError.value = '';

        validatePassword();
        validatePasswordConfirmation();

        if (passwordError.value || passwordConfirmationError.value) return;

        const result = await register({
            email: form.email,
            name: form.name,
            password: form.password,
            password_confirmation: form.password_confirmation,
            date_of_birth: form.date_of_birth,
            gender: form.gender!,
        });

        if (!result.success) {
            if (result.errors) errors.value = result.errors;
            if (result.message) errorMessage.value = result.message;
        }
    };

    onMounted(async () => {
        if (isAuthenticated.value) {
            await router.push('/profile');
        }
    });

    return {
        form,
        rules,
        loading,

        errors,
        errorMessage,
        passwordError,
        passwordConfirmationError,
        passwordRequirements,

        validatePassword,
        validatePasswordConfirmation,
        handleSubmit,
    };
}
