<template>
    <a-flex
        class="runner-result"
        vertical
        :gap="16"
    >
        <a-card class="runner-result__summary" :bordered="false">
            <a-flex
                vertical
                align="center"
                :gap="12"
            >
                <a-progress
                    class="runner-result__progress"
                    type="circle"
                    :percent="result.percent"
                    :status="result.status"
                    :size="140"
                />

                <h2 class="runner-result__title">{{ result.title }}</h2>

                <p class="runner-result__counter">{{ counterLabel }}</p>

                <a-button
                    class="runner-result__restart"
                    size="large"
                    @click="handleRestart"
                >
                    <template #icon>
                        <ReloadOutlined />
                    </template>
                    Пройти заново
                </a-button>
            </a-flex>
        </a-card>

        <a-card
            class="runner-result__details"
            title="Разбор ответов"
            :bordered="false"
        >
            <a-flex vertical :gap="10">
                <TestRunnerResultItem
                    v-for="item in result.items"
                    :key="item.number"
                    :item="item"
                />
            </a-flex>
        </a-card>
    </a-flex>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import TestRunnerResultItem from '@/components/runner/TestRunnerResultItem.vue';
import type { RunnerResult } from '@/types/TestRunner.ts';

interface TestRunnerResultProps {
    result: RunnerResult;
}

const props = defineProps<TestRunnerResultProps>();
const { result } = toRefs(props);

const emit = defineEmits<{
    (e: 'restart'): void;
}>();

const counterLabel = computed((): string => `Правильных ответов: ${result.value.correctCount} из ${result.value.totalCount}`);

const handleRestart = (): void => {
    emit('restart');
};
</script>
