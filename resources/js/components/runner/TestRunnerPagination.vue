<template>
    <a-flex
        class="runner-pages"
        align="center"
        justify="center"
        :gap="6"
        wrap="wrap"
    >
        <button
            v-for="item in items"
            :key="item.id"
            class="runner-pages__item"
            :class="itemClass(item)"
            type="button"
            @click="handleSelect(item.id)"
        >
            {{ item.number }}
        </button>
    </a-flex>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { useRunnerPagination } from '@/composables/runner/useRunnerPagination.ts';
import type { RunnerPaginationItem } from '@/types/runner/TestRunner.ts';

interface TestRunnerPaginationProps {
    items: RunnerPaginationItem[];
}

const props = defineProps<TestRunnerPaginationProps>();
const { items } = toRefs(props);

const emit = defineEmits<{
    (e: 'select', questionId: string): void;
}>();

const { itemClass } = useRunnerPagination();

const handleSelect = (questionId: string): void => {
    emit('select', questionId);
};
</script>
