<template>
    <div class="auth-page">
        <div class="auth-container">
            <h1 class="auth-title">Регистрация</h1>

            <a-form
                :model="form"
                :rules="rules"
                @finish="handleSubmit"
                layout="vertical"
                class="auth-form"
            >
                <a-form-item
                    name="email"
                    :validate-status="errors.email ? 'error' : ''"
                    :help="errors.email?.[0]"
                >
                    <template #label>
                        <span>Email</span>
                    </template>
                    <a-input
                        v-model:value="form.email"
                        type="email"
                        placeholder="Введите email"
                        size="large"
                    />
                </a-form-item>

                <a-form-item
                    name="name"
                    :validate-status="errors.name ? 'error' : ''"
                    :help="errors.name?.[0]"
                >
                    <template #label>
                        <span>Логин</span>
                    </template>
                    <a-input
                        v-model:value="form.name"
                        placeholder="Введите логин"
                        size="large"
                    />
                </a-form-item>

                <a-form-item
                    name="password"
                    :validate-status="passwordError ? 'error' : ''"
                    :help="passwordError"
                >
                    <template #label>
                        <span>Пароль</span>
                    </template>
                    <a-input-password
                        v-model:value="form.password"
                        placeholder="Введите пароль"
                        size="large"
                        @blur="validatePassword"
                    />
                    <div v-if="passwordRequirements.length > 0" class="password-requirements">
                        <div
                            v-for="(req, index) in passwordRequirements"
                            :key="index"
                            :class="['requirement', { 'requirement-met': req.met }]"
                        >
                            <span v-if="req.met">✓</span>
                            <span v-else>✗</span>
                            {{ req.text }}
                        </div>
                    </div>
                </a-form-item>

                <a-form-item
                    name="password_confirmation"
                    :validate-status="passwordConfirmationError ? 'error' : ''"
                    :help="passwordConfirmationError"
                >
                    <template #label>
                        <span>Повтор пароля</span>
                    </template>
                    <a-input-password
                        v-model:value="form.password_confirmation"
                        placeholder="Повторите пароль"
                        size="large"
                        @blur="validatePasswordConfirmation"
                    />
                </a-form-item>

                <a-form-item
                    name="date_of_birth"
                    :validate-status="errors.date_of_birth ? 'error' : ''"
                    :help="errors.date_of_birth?.[0]"
                >
                    <template #label>
                        <span>Дата рождения</span>
                    </template>
                    <a-date-picker
                        v-model:value="form.date_of_birth"
                        placeholder="Выберите дату"
                        size="large"
                        style="width: 100%"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                    />
                </a-form-item>

                <a-form-item
                    name="gender"
                    :validate-status="errors.gender ? 'error' : ''"
                    :help="errors.gender?.[0]"
                >
                    <template #label>
                        <span>Пол</span>
                    </template>
                    <a-radio-group v-model:value="form.gender" size="large">
                        <a-radio value="male">Мужской</a-radio>
                        <a-radio value="female">Женский</a-radio>
                    </a-radio-group>
                </a-form-item>

                <a-form-item v-if="errorMessage">
                    <a-alert
                        :message="errorMessage"
                        type="error"
                        show-icon
                        closable
                        @close="errorMessage = ''"
                    />
                </a-form-item>

                <a-form-item>
                    <a-button
                        type="primary"
                        html-type="submit"
                        size="large"
                        :loading="loading"
                        block
                    >
                        Зарегистрироваться
                    </a-button>
                </a-form-item>

                <div class="auth-divider">
                    <span>или</span>
                </div>

                <div class="auth-register-link">
                    <span>Уже есть аккаунт?</span>
                    <router-link to="/login">Войти</router-link>
                </div>
            </a-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import type { Rule } from 'ant-design-vue/es/form';
// import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

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
        {
            text: 'Минимум 8 символов',
            met: password.length >= 8,
        },
        {
            text: 'Минимум 1 заглавная буква',
            met: /[A-ZА-ЯЁ]/.test(password),
        },
        {
            text: 'Минимум 1 строчная буква',
            met: /[a-zа-яё]/.test(password),
        },
        {
            text: 'Минимум 1 цифра',
            met: /\d/.test(password),
        },
    ];
});

const validatePassword = () => {
    passwordError.value = '';
    const password = form.password;

    if (!password) {
        return;
    }

    const requirements = passwordRequirements.value;
    const unmet = requirements.filter((req) => !req.met);

    if (unmet.length > 0) {
        passwordError.value = 'Пароль не соответствует требованиям';
    }
};

const validatePasswordConfirmation = () => {
    passwordConfirmationError.value = '';

    if (!form.password_confirmation) {
        return;
    }

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
                if (form.password && passwordRequirements.value.some((req) => !req.met)) {
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

// Редирект если уже авторизован
onMounted(async () => {
    if (isAuthenticated.value) {
        await router.push('/profile');
    }
});

const handleSubmit = async () => {
    errors.value = {};
    errorMessage.value = '';
    passwordError.value = '';
    passwordConfirmationError.value = '';

    // Валидация пароля
    validatePassword();
    validatePasswordConfirmation();

    if (passwordError.value || passwordConfirmationError.value) {
        return;
    }

    const result = await register({
        email: form.email,
        name: form.name,
        password: form.password,
        password_confirmation: form.password_confirmation,
        date_of_birth: '',
        gender: form.gender!,
    });

    if (!result.success) {
        if (result.errors) {
            errors.value = result.errors;
        }
        if (result.message) {
            errorMessage.value = result.message;
        }
    }
};
</script>

<style scoped lang="scss">
.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    padding: 24px;
}

.auth-container {
    width: 100%;
    max-width: 500px;
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-title {
    font-size: 28px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 32px;
    color: #1677ff;
}

.auth-form {
    :deep(.ant-form-item-label > label) {
        font-weight: 500;
    }
}

.password-requirements {
    margin-top: 8px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 12px;
}

.requirement {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    color: #8c8c8c;

    &:last-child {
        margin-bottom: 0;
    }

    span {
        font-weight: bold;
    }

    &-met {
        color: #52c41a;

        span {
            color: #52c41a;
        }
    }
}

.auth-divider {
    text-align: center;
    margin: 24px 0;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 1px;
        background: #e7e7e7;
    }

    span {
        position: relative;
        background: white;
        padding: 0 16px;
        color: #8c8c8c;
    }
}

.auth-register-link {
    text-align: center;
    margin-top: 16px;

    span {
        color: #8c8c8c;
        margin-right: 8px;
    }

    a {
        color: #1677ff;
        font-weight: 500;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
