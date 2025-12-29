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
import { useLoginForm } from '@/composables/components/useLoginForm';

const {
    form,
    rules,
    loading,
    errors,
    errorMessage,
    handleSubmit,
} = useLoginForm();
</script>

