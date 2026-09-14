<template>
    <a-flex
        class="runner-question"
        vertical
        :gap="16"
    >
        <h2 class="runner-question__text">
            <span class="runner-question__number">{{ questionNumber }}.</span>
            {{ questionText }}
        </h2>

        <a-radio-group
            class="runner-question__answers"
            :value="selectedAnswerId"
            @change="handleSelect"
        >
            <a-radio
                v-for="answer in answers"
                :key="answer.id"
                class="runner-question__answer"
                :class="answerClass(answer)"
                :value="answer.id"
            >
                {{ answer.text }}
            </a-radio>
        </a-radio-group>
    </a-flex>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import type { RadioChangeEvent } from 'ant-design-vue';
import { useRunnerSlide } from '@/composables/runner/useRunnerSlide.ts';
import type { RunnerSlide } from '@/types/TestRunner.ts';

interface TestRunnerQuestionProps {
    slide: RunnerSlide;
}

const props = defineProps<TestRunnerQuestionProps>();
const { slide } = toRefs(props);

const emit = defineEmits<{
    (e: 'select', answerId: string): void;
}>();

const { questionNumber, questionText, answers, selectedAnswerId, answerClass } = useRunnerSlide(slide);

const handleSelect = (event: RadioChangeEvent): void => {
    emit('select', String(event.target.value));
};
</script>
