<template>
    <div class="auth-page">
        <div class="auth-container">
            <h1 class="auth-title">Вход</h1>

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
                    name="password"
                    :validate-status="errors.password ? 'error' : ''"
                    :help="errors.password?.[0]"
                >
                    <template #label>
                        <span>Пароль</span>
                    </template>
                    <a-input-password
                        v-model:value="form.password"
                        placeholder="Введите пароль"
                        size="large"
                    />
                </a-form-item>

                <a-form-item>
                    <a-checkbox v-model:checked="form.remember">
                        Запомнить меня
                    </a-checkbox>
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
                        Войти
                    </a-button>
                </a-form-item>

                <div class="auth-links">
                    <a href="/forgot-password">Забыли пароль?</a>
                </div>

                <div class="auth-divider">
                    <span>или</span>
                </div>

                <div class="auth-register-link">
                    <span>Нет аккаунта?</span>
                    <router-link to="/register">Зарегистрироваться</router-link>
                </div>
            </a-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import type { Rule } from 'ant-design-vue/es/form';

const router = useRouter();
const { login, isAuthenticated, loading } = useAuth();

const form = reactive({
    email: '',
    password: '',
    remember: false,
});

const errors = ref<Record<string, string[]>>({});
const errorMessage = ref('');

const rules: Record<string, Rule[]> = {
    email: [
        { required: true, message: 'Пожалуйста, введите email', trigger: 'blur' },
        { type: 'email', message: 'Введите корректный email', trigger: 'blur' },
    ],
    password: [
        { required: true, message: 'Пожалуйста, введите пароль', trigger: 'blur' },
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

    const result = await login({
        email: form.email,
        password: form.password,
        remember: form.remember,
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
    max-width: 400px;
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

.auth-links {
    text-align: center;
    margin-top: -8px;
    margin-bottom: 16px;

    a {
        color: #1677ff;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
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
