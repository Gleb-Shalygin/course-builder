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
                >
                    <template #label>
                        <span>Email</span>
                    </template>
                    <a-input
                        v-model="form.email"
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
import { useRegisterForm } from '@/composables/components/useRegisterForm';

const {
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
} = useRegisterForm();
</script>
