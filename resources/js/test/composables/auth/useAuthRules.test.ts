import { reactive } from 'vue';
import type { Rule } from 'ant-design-vue/es/form';
import { useAuthRules } from '@/composables/auth/useAuthRules';

describe('useAuthRules', () => {
    function setup(password: string, passwordConfirmation = password) {
        const form = reactive({ password, password_confirmation: passwordConfirmation });

        return { form, ...useAuthRules(form) };
    }

    function runValidator(rule: Rule, value: string): Promise<void> | void {
        if (rule.validator === undefined) throw new Error('Rule has no validator');

        return rule.validator(rule, value, () => undefined);
    }

    describe('passwordRequirements', () => {
        it('marks all requirements as met for strong password', () => {
            const { passwordRequirements } = setup('Secret123');

            expect(passwordRequirements.value.every((requirement) => requirement.met)).toBe(true);
        });

        it.each([
            ['Sec1', 'Минимум 8 символов'],
            ['secret123', 'Минимум 1 заглавная буква'],
            ['SECRET123', 'Минимум 1 строчная буква'],
            ['Secretabc', 'Минимум 1 цифра'],
        ])('flags %s as missing "%s"', (password, requirement) => {
            const { passwordRequirements } = setup(password);

            const unmet = passwordRequirements.value.filter((item) => !item.met).map((item) => item.text);

            expect(unmet).toEqual([requirement]);
        });

        it('accepts cyrillic letters', () => {
            const { passwordRequirements } = setup('Пароль123');

            expect(passwordRequirements.value.every((requirement) => requirement.met)).toBe(true);
        });

        it('accepts letter Ё in both cases', () => {
            const { passwordRequirements } = setup('Ёёёёёёё1');

            expect(passwordRequirements.value.every((requirement) => requirement.met)).toBe(true);
        });

        it('updates when password changes', () => {
            const { form, passwordRequirements } = setup('secret');

            form.password = 'Secret123';

            expect(passwordRequirements.value.every((requirement) => requirement.met)).toBe(true);
        });
    });

    describe('password validator', () => {
        it('rejects password that misses requirements', async () => {
            const { rules } = setup('secret');

            await expect(runValidator(rules.password[1], 'secret')).rejects.toBe('Пароль не соответствует требованиям');
        });

        it('accepts strong password', async () => {
            const { rules } = setup('Secret123');

            await expect(runValidator(rules.password[1], 'Secret123')).resolves.toBeUndefined();
        });

        it('leaves empty password to required rule', async () => {
            const { rules } = setup('');

            await expect(runValidator(rules.password[1], '')).resolves.toBeUndefined();
        });
    });

    describe('password confirmation validator', () => {
        it('rejects mismatched confirmation', async () => {
            const { rules } = setup('Secret123', 'Secret124');

            await expect(runValidator(rules.password_confirmation[1], 'Secret124')).rejects.toBe('Пароли не совпадают');
        });

        it('accepts matching confirmation', async () => {
            const { rules } = setup('Secret123');

            await expect(runValidator(rules.password_confirmation[1], 'Secret123')).resolves.toBeUndefined();
        });
    });
});
