<template>
    <a-spin
        :wrapper-class-name="loaderClass"
        :spinning="isLoading"
        tip="Загружаем тест..."
    >
        <a-flex class="runner" vertical :gap="16">
            <a-alert
                v-if="isError"
                class="runner__error"
                type="error"
                :message="errorMessage"
                show-icon
            >
                <template #action>
                    <a-button size="small" @click="loadTest">Повторить</a-button>
                </template>
            </a-alert>

            <template v-if="isReady">
                <a-flex
                    v-if="isProgressVisible"
                    class="runner__progress"
                    vertical
                    :gap="4"
                >
                    <span class="runner__progress-label">{{ progressLabel }}</span>
                    <a-progress :percent="progressPercent" :show-info="false" />
                </a-flex>

                <transition name="slide" mode="out-in">
                    <TestRunnerIntro
                        v-if="isIntro"
                        :key="'intro'"
                        :test="test"
                        @start="startTest"
                    />

                    <a-flex
                        v-else-if="isQuestion"
                        :key="'question'"
                        class="runner__slide"
                        vertical
                        :gap="16"
                    >
                        <TestRunnerQuestion :slide="slide" @select="handleSelect" />
                        <TestRunnerNav
                            :nav="nav"
                            :pagination="pagination"
                            @prev="goPrev"
                            @next="goNext"
                            @jump="goToQuestion"
                        />
                    </a-flex>

                    <TestRunnerFinish
                        v-else-if="isFinish"
                        :key="'finish'"
                        :finish="finishState"
                        @back="goPrev"
                        @finish="finishTest"
                    />

                    <TestRunnerResult
                        v-else-if="isResult"
                        :key="'result'"
                        :result="result"
                        @restart="restartTest"
                    />
                </transition>
            </template>
        </a-flex>
    </a-spin>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import TestRunnerFinish from '@/components/runner/TestRunnerFinish.vue';
import TestRunnerIntro from '@/components/runner/TestRunnerIntro.vue';
import TestRunnerNav from '@/components/runner/TestRunnerNav.vue';
import TestRunnerQuestion from '@/components/runner/TestRunnerQuestion.vue';
import TestRunnerResult from '@/components/runner/TestRunnerResult.vue';
import { useTestRunner } from '@/composables/runner/useTestRunner.ts';

interface TestRunnerProps {
    testId: number | null;
}

const props = defineProps<TestRunnerProps>();
const { testId } = toRefs(props);

const {
    test,
    isLoading,
    isError,
    errorMessage,
    isReady,
    isIntro,
    isQuestion,
    isFinish,
    isResult,
    isProgressVisible,
    loaderClass,
    progressPercent,
    progressLabel,
    slide,
    nav,
    pagination,
    finishState,
    result,
    loadTest,
    startTest,
    handleSelect,
    goPrev,
    goNext,
    goToQuestion,
    finishTest,
    restartTest,
} = useTestRunner(testId);
</script>
