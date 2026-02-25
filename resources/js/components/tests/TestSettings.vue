<template>
    <a-modal
        :open="open"
        title="Настройки теста"
        width="520px"
        @cancel="handleCancel"
        @ok="handleOk"
        ok-text="Сохранить"
        cancel-text="Отмена"
    >
        <div class="test-settings">
            <div class="test-settings__block">
                <div class="test-settings__label">Тип доступа</div>
                <a-select v-model:value="localSettings.accessType" class="test-settings__full-width">
                    <a-select-option value="private">Закрытый (логин/пароль)</a-select-option>
                    <a-select-option value="link">Доступ по ссылке</a-select-option>
                    <a-select-option value="cabinet">Через личный кабинет</a-select-option>
                </a-select>
            </div>

            <div class="test-settings__block">
                <div class="test-settings__label">
                    Email
                    <span class="test-settings__required">*</span>
                </div>
                <a-input
                    v-model:value="localSettings.email"
                    type="email"
                    placeholder="email@example.com"
                    :status="emailError ? 'error' : ''"
                />
                <div v-if="emailError" class="test-settings__error">
                    {{ emailError }}
                </div>
                <a-checkbox v-model:checked="localSettings.sendResultsToEmail">
                    Высылать результаты теста на почту
                </a-checkbox>
            </div>

            <div class="test-settings__block">
                <div class="test-settings__label">Проверка преподавателем</div>
                <div class="test-settings__row">
                    <a-badge status="success" text="Доступно для пользователей с личным кабинетом" />
                    <a-checkbox v-model:checked="localSettings.teacherReviewed" disabled>
                        Просмотрен преподавателем
                    </a-checkbox>
                </div>
            </div>

            <div class="test-settings__block">
                <a-checkbox v-model:checked="localSettings.individualChecking">
                    Индивидуальная проверка / Проверка по правильным ответам
                </a-checkbox>
                <p class="test-settings__hint">
                    Если включено, во всех вопросах должны быть указаны правильные ответы.
                </p>
            </div>

            <div class="test-settings__block">
                <div class="test-settings__label">Количество попыток</div>
                <a-input-number
                    v-model:value="localSettings.attempts"
                    :min="1"
                    :max="99"
                    class="test-settings__attempts"
                />
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TestSettings } from '@/types/Test';
import { useValidation } from '@/composables/tests/useValidation';

const props = defineProps<{
    open: boolean;
    settings: TestSettings;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'update:settings', value: TestSettings): void;
}>();

const { validateEmail } = useValidation();

const localSettings = ref<TestSettings>({ ...props.settings });
const emailError = ref<string | null>(null);

watch(
    () => props.settings,
    (next) => {
        localSettings.value = { ...next };
    },
    { deep: true }
);

const close = () => {
    emit('update:open', false);
};

const handleCancel = () => {
    localSettings.value = { ...props.settings };
    emailError.value = null;
    close();
};

const validate = () => {
    const result = validateEmail(localSettings.value.email);
    emailError.value = result.valid ? null : result.message ?? null;
    if (!localSettings.value.attempts || localSettings.value.attempts < 1) {
        emailError.value = emailError.value ?? 'Количество попыток не может быть меньше 1.';
    }
    return !emailError.value;
};

const handleOk = () => {
    if (!validate()) return;
    emit('update:settings', { ...localSettings.value });
    close();
};
</script>

<style scoped lang="scss">
.test-settings {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &__block {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    &__label {
        font-size: 13px;
        font-weight: 500;
        color: #111827;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    &__required {
        color: #ef4444;
    }

    &__error {
        font-size: 12px;
        color: #ef4444;
    }

    &__hint {
        margin: 0;
        font-size: 12px;
        color: #6b7280;
    }

    &__row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
    }

    &__full-width {
        width: 100%;
    }

    &__attempts {
        width: 120px;
    }
}
</style>

