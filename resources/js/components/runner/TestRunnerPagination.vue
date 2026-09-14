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
            :key="item.number"
            class="runner-pages__item"
            :class="itemClass(item)"
            type="button"
            @click="handleSelect(item.index)"
        >
            {{ item.number }}
        </button>
    </a-flex>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { useRunnerPagination } from '@/composables/runner/useRunnerPagination.ts';
import type { RunnerPaginationItem } from '@/types/TestRunner.ts';

interface TestRunnerPaginationProps {
    items: RunnerPaginationItem[];
}

const props = defineProps<TestRunnerPaginationProps>();
const { items } = toRefs(props);

const emit = defineEmits<{
    (e: 'select', index: number): void;
}>();

const { itemClass } = useRunnerPagination();

const handleSelect = (index: number): void => {
    emit('select', index);
};
</script>
