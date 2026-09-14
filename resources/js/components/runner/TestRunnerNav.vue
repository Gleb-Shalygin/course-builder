<template>
    <a-flex
        class="runner-nav"
        vertical
        align="center"
        :gap="10"
    >
        <a-flex
            class="runner-nav__row"
            align="center"
            justify="center"
            :gap="12"
        >
            <a-tooltip title="Назад">
                <a-button
                    class="runner-nav__button"
                    shape="circle"
                    size="large"
                    :disabled="nav.isPrevDisabled"
                    @click="handlePrev"
                >
                    <template #icon>
                        <svg
                            class="runner-nav__icon runner-nav__icon--prev"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path d="M10.02 6L8.61 7.41L13.19 12l-4.58 4.59L10.02 18l6-6l-6-6z" fill="currentColor" />
                        </svg>
                    </template>
                </a-button>
            </a-tooltip>

            <TestRunnerPagination :items="pagination" @select="handleJump" />

            <a-tooltip :title="nav.nextLabel">
                <a-button
                    class="runner-nav__button runner-nav__button--next"
                    type="primary"
                    shape="circle"
                    size="large"
                    :disabled="nav.isNextDisabled"
                    @click="handleNext"
                >
                    <template #icon>
                        <CheckOutlined v-if="nav.isLast" />
                        <svg
                            v-else
                            class="runner-nav__icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path d="M10.02 6L8.61 7.41L13.19 12l-4.58 4.59L10.02 18l6-6l-6-6z" fill="currentColor" />
                        </svg>
                    </template>
                </a-button>
            </a-tooltip>
        </a-flex>
    </a-flex>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { CheckOutlined } from '@ant-design/icons-vue';
import TestRunnerPagination from '@/components/runner/TestRunnerPagination.vue';
import type { RunnerNavState, RunnerPaginationItem } from '@/types/TestRunner.ts';

interface TestRunnerNavProps {
    nav: RunnerNavState;
    pagination: RunnerPaginationItem[];
}

const props = defineProps<TestRunnerNavProps>();
const { nav } = toRefs(props);

const emit = defineEmits<{
    (e: 'prev'): void;
    (e: 'next'): void;
    (e: 'jump', index: number): void;
}>();

const handlePrev = (): void => {
    emit('prev');
};

const handleNext = (): void => {
    emit('next');
};

const handleJump = (index: number): void => {
    emit('jump', index);
};
</script>
