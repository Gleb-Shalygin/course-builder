<template>
    <a-flex
        class="runner-intro"
        vertical
        align="center"
        :gap="16"
    >
        <a-tag class="runner-intro__badge" color="blue">{{ questionsLabel }}</a-tag>

        <h1 class="runner-intro__title">{{ test.title }}</h1>

        <p v-if="isDescriptionVisible" class="runner-intro__description">{{ test.description }}</p>

        <a-button
            class="runner-intro__start"
            type="primary"
            size="large"
            @click="handleStart"
        >
            Начать
        </a-button>
    </a-flex>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import type { RunnerTest } from '@/types/TestRunner.ts';

interface TestRunnerIntroProps {
    test: RunnerTest;
}

const props = defineProps<TestRunnerIntroProps>();
const { test } = toRefs(props);

const emit = defineEmits<{
    (e: 'start'): void;
}>();

const questionsLabel = computed((): string => `Вопросов: ${test.value.questions.length}`);
const isDescriptionVisible = computed((): boolean => test.value.description !== null && test.value.description.trim() !== '');

const handleStart = (): void => {
    emit('start');
};
</script>
