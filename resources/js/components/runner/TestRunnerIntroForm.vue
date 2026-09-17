<template>
    <a-flex
        class="runner-intro-form"
        vertical
        :gap="12"
    >
        <a-input
            v-model:value="firstName"
            class="runner-intro-form__field"
            size="large"
            placeholder="Имя"
            :disabled="isSubmitting"
        />

        <a-input
            v-model:value="lastName"
            class="runner-intro-form__field"
            size="large"
            placeholder="Фамилия"
            :disabled="isSubmitting"
        />

        <a-alert
            v-if="isValidationVisible"
            class="runner-intro-form__alert"
            type="warning"
            :message="validationMessage"
            show-icon
        />

        <a-button
            class="runner-intro-form__submit"
            type="primary"
            size="large"
            :loading="isSubmitting"
            @click="handleStart"
        >
            Начать
        </a-button>
    </a-flex>
</template>

<script setup lang="ts">
import { useRunnerIntroForm } from '@/composables/runner/useRunnerIntroForm.ts';
import type { RunnerParticipantForm } from '@/types/runner/TestRunner.ts';

defineProps<{
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    (e: 'start', participant: RunnerParticipantForm): void;
}>();

const {
    firstName,
    lastName,
    validationMessage,
    isValidationVisible,
    participant,
    validate,
} = useRunnerIntroForm();

const handleStart = (): void => {
    if (!validate()) return;
    emit('start', participant.value);
};
</script>
