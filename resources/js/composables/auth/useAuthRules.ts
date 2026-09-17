import type { Rule } from 'ant-design-vue/es/form';
import { computed } from 'vue';

export function useAuthRules(form) {
    const passwordRequirements = computed(() => {
        const password = form.password;
        return [
            { text: 'Минимум 8 символов', met: password.length >= 8 },
            { text: 'Минимум 1 заглавная буква', met: /[A-ZА-ЯЁ]/.test(password) },
            { text: 'Минимум 1 строчная буква', met: /[a-zа-яё]/.test(password) },
            { text: 'Минимум 1 цифра', met: /\d/.test(password) },
        ];
    });

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

    return {
        rules,
        passwordRequirements
    };
}
