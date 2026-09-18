<template>
    <a-flex
        class="runner-finish"
        vertical
        align="center"
        :gap="16"
    >
        <CheckCircleOutlined class="runner-finish__icon" />

        <h2 class="runner-finish__title">Вы действительно хотите завершить тест?</h2>

        <p class="runner-finish__counter">{{ counterLabel }}</p>

        <a-alert
            v-if="isWarningVisible"
            class="runner-finish__alert"
            type="warning"
            :message="finish.hint"
            show-icon
        />
        <span v-else class="runner-finish__hint">{{ finish.hint }}</span>

        <a-flex class="runner-finish__actions" :gap="12">
            <a-button
                class="runner-finish__button"
                size="large"
                @click="handleBack"
            >
                Назад к вопросам
            </a-button>

            <a-button
                class="runner-finish__button runner-finish__button--submit"
                type="primary"
                size="large"
                @click="handleFinish"
            >
                Завершить тест
            </a-button>
        </a-flex>
    </a-flex>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import type { RunnerFinishState } from '@/types/runner/TestRunner.ts';

interface TestRunnerFinishProps {
    finish: RunnerFinishState;
}

const props = defineProps<TestRunnerFinishProps>();
const { finish } = toRefs(props);

const emit = defineEmits<{
    (e: 'back'): void;
    (e: 'finish'): void;
}>();

const counterLabel = computed((): string => `Отвечено ${finish.value.answeredCount} из ${finish.value.totalCount} вопросов`);
const isWarningVisible = computed((): boolean => !finish.value.isComplete);

const handleBack = (): void => {
    emit('back');
};

const handleFinish = (): void => {
    emit('finish');
};
</script>
