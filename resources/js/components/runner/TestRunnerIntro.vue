<template>
    <a-flex
        class="runner-intro"
        vertical
        align="center"
        :gap="16"
    >
        <h1 class="runner-intro__title">{{ test.title }}</h1>

        <p v-if="isDescriptionVisible" class="runner-intro__description">{{ test.description }}</p>

        <TestRunnerIntroForm :is-submitting="isSubmitting" @start="handleStart" />
    </a-flex>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import TestRunnerIntroForm from '@/components/runner/TestRunnerIntroForm.vue';
import type { RunnerParticipantForm, RunnerTest } from '@/types/runner/TestRunner.ts';

const props = defineProps<{
    test: RunnerTest;
    isSubmitting: boolean;
}>();
const { test } = toRefs(props);

const emit = defineEmits<{
    (e: 'start', participant: RunnerParticipantForm): void;
}>();

const isDescriptionVisible = computed((): boolean => test.value.description !== null && test.value.description.trim() !== '');

const handleStart = (participant: RunnerParticipantForm): void => {
    emit('start', participant);
};
</script>
