<template>
    <a-spin class="test-form__loader" :spinning="isLoading" tip="Загружаем тест...">
        <a-flex class="test-form" vertical :gap="16">
            <TestFormHead :count-label="savedCountLabel" />

            <TestTitleField :title="title" @update:title="handleTitle" />

            <TestToolbar :attempts="attempts" :test-id="currentTestId" @update:attempts="handleAttempts" />

            <a-empty v-if="isEmpty" class="test-form__empty" description="Пока ни одного вопроса — начните с плюсика ниже" />

            <transition-group name="question" tag="div" class="test-form__list" :class="listClass">
                <TestQuestionItem
                    v-for="(question, index) in savedQuestions"
                    :key="question.id"
                    :question="question"
                    :index="index"
                    @edit="editQuestion"
                    @remove="removeQuestion"
                />
            </transition-group>

            <transition name="editor">
                <TestQuestionEditor v-if="editingQuestion" :question="editingQuestion" @save="saveQuestion" @cancel="cancelQuestion" />
            </transition>

            <TestAddQuestion :disabled="isEditing" :is-first="isEmpty" @add="addQuestion" />

            <a-alert v-if="isError" class="test-form__error" type="error" :message="errorMessage" show-icon>
                <template v-if="isLoadError" #action>
                    <a-button size="small" @click="loadTest">Повторить</a-button>
                </template>
            </a-alert>

            <a-button
                class="test-form__submit"
                type="primary"
                size="large"
                block
                :loading="isSaving"
                :disabled="isSubmitDisabled"
                @click="handleSaveTest"
            >
                <template #icon>
                    <SaveOutlined />
                </template>
                {{ submitLabel }}
            </a-button>
        </a-flex>
    </a-spin>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { SaveOutlined } from '@ant-design/icons-vue';
import TestAddQuestion from '@/components/tests/TestAddQuestion.vue';
import TestFormHead from '@/components/tests/TestFormHead.vue';
import TestQuestionEditor from '@/components/tests/TestQuestionEditor.vue';
import TestQuestionItem from '@/components/tests/TestQuestionItem.vue';
import TestTitleField from '@/components/tests/TestTitleField.vue';
import TestToolbar from '@/components/tests/TestToolbar.vue';
import { useTestForm } from '@/composables/tests/useTestForm';

interface TestFormProps {
    testId: number | null;
}

const props = defineProps<TestFormProps>();
const { testId } = toRefs(props);

const {
    title,
    attempts,
    savedQuestions,
    editingQuestion,
    isEditing,
    isEmpty,
    savedCountLabel,
    currentTestId,
    listClass,
    submitLabel,
    isLoading,
    isLoadError,
    isSaving,
    isError,
    errorMessage,
    isSubmitDisabled,
    addQuestion,
    editQuestion,
    saveQuestion,
    cancelQuestion,
    removeQuestion,
    handleTitle,
    handleAttempts,
    handleSaveTest,
    loadTest,
} = useTestForm(testId);
</script>
