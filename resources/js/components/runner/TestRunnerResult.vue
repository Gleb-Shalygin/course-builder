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
import { toRefs } from 'vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import TestRunnerResultItem from '@/components/runner/TestRunnerResultItem.vue';
import { useTestRunnerResult } from '@/composables/runner/useTestRunnerResult';
import type { RunnerResult } from '@/types/TestRunner.ts';

const props = defineProps<{
    result: RunnerResult;
}>();
const { result } = toRefs(props);

const emit = defineEmits<{
    (e: 'restart'): void;
}>();

const { counterLabel, handleRestart } = useTestRunnerResult(result, emit);
</script>
