// src/composables/useLoginForm.ts
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import type { Rule } from 'ant-design-vue/es/form';

export function useLoginForm() {
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

    const handleSubmit = async () => {
        errors.value = {};
        errorMessage.value = '';

        const result = await login({
            email: form.email,
            password: form.password,
            remember: form.remember,
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

        handleSubmit,
    };
}
