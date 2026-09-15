<template>
    <a-flex class="runner-answer" :class="rootClass" vertical :gap="6">
        <a-flex class="runner-answer__head" align="flex-start" :gap="8">
            <CheckCircleFilled v-if="item.isCorrect" class="runner-answer__icon runner-answer__icon--correct" />
            <CloseCircleFilled v-else class="runner-answer__icon runner-answer__icon--wrong" />

            <span class="runner-answer__question">{{ item.number }}. {{ item.questionText }}</span>
        </a-flex>

        <span class="runner-answer__row"
            >Ваш ответ: <b>{{ selectedLabel }}</b></span
        >

        <span v-if="isCorrectVisible" class="runner-answer__row runner-answer__row--correct">
            Правильный ответ: <b>{{ item.correctText }}</b>
        </span>
    </a-flex>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue';
import { useTestRunnerResultItem } from '@/composables/runner/useTestRunnerResultItem';
import type { RunnerResultItem } from '@/types/TestRunner.ts';

const props = defineProps<{
    item: RunnerResultItem;
}>();
const { item } = toRefs(props);

const { rootClass, selectedLabel, isCorrectVisible } = useTestRunnerResultItem(item);
</script>
