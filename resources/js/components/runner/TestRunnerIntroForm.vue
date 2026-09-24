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

        <a-button
            class="runner-intro-form__submit"
            type="primary"
            size="large"
            :disabled="!isFilled"
            :loading="isSubmitting"
            @click="handleStart"
        >
            Начать
        </a-button>

        <p
            v-if="isHintVisible"
            class="runner-intro-form__hint"
        >
            Укажите имя и фамилию, чтобы начать тест — так мы поймём, чей это результат
        </p>
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
    isFilled,
    isHintVisible,
    participant,
} = useRunnerIntroForm();

const handleStart = (): void => {
    emit('start', participant.value);
};
</script>
