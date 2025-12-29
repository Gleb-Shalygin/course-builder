import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import type { Rule } from 'ant-design-vue/es/form';
import type { Dayjs } from 'dayjs';

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

    const errors = ref<Record<string, string[]>>({});
    const errorMessage = ref('');
    const passwordError = ref('');
    const passwordConfirmationError = ref('');

    const passwordRequirements = computed(() => {
        const password = form.password;
        return [
            { text: 'Минимум 8 символов', met: password.length >= 8 },
            { text: 'Минимум 1 заглавная буква', met: /[A-ZА-ЯЁ]/.test(password) },
            { text: 'Минимум 1 строчная буква', met: /[a-zа-яё]/.test(password) },
            { text: 'Минимум 1 цифра', met: /\d/.test(password) },
        ];
    });

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

    const rules: Record<string, Rule[]> = {
        email: [
            { required: true, message: 'Пожалуйста, введите email', trigger: 'blur' },
            { type: 'email', message: 'Введите корректный email', trigger: 'blur' },
        ],
        name: [
            { required: true, message: 'Пожалуйста, введите логин', trigger: 'blur' },
        ],
        password: [
            { required: true, message: 'Пожалуйста, введите пароль', trigger: 'blur' },
            {
                validator: () => {
                    if (form.password && passwordRequirements.value.some(req => !req.met)) {
                        return Promise.reject('Пароль не соответствует требованиям');
                    }
                    return Promise.resolve();
                },
                trigger: 'blur',
            },
        ],
        password_confirmation: [
            { required: true, message: 'Пожалуйста, повторите пароль', trigger: 'blur' },
            {
                validator: () => {
                    if (form.password !== form.password_confirmation) {
                        return Promise.reject('Пароли не совпадают');
                    }
                    return Promise.resolve();
                },
                trigger: 'blur',
            },
        ],
        date_of_birth: [
            { required: true, message: 'Пожалуйста, выберите дату рождения', trigger: 'change' },
        ],
        gender: [
            { required: true, message: 'Пожалуйста, выберите пол', trigger: 'change' },
        ],
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
            date_of_birth: '',
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
