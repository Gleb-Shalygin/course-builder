<template>
    <a-spin class="test-form__loader" :spinning="isLoading" tip="Загружаем тест...">
        <a-flex class="test-form" vertical :gap="16">
            <TestFormHead :count-label="savedCountLabel" />

            <TestTitleField :title="title" @update:title="handleTitle" />

            <TestDescriptionField :description="description" @update:description="handleDescription" />

            <TestToolbar :attempts="attempts" :link="testLink" @update:attempts="handleAttempts" />

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

            <TestFormFooter :footer="footer" @save="handleSaveTest" />
        </a-flex>
    </a-spin>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import TestAddQuestion from '@/components/tests/question/TestAddQuestion.vue';
import TestDescriptionField from '@/components/tests/form/TestDescriptionField.vue';
import TestFormFooter from '@/components/tests/form/TestFormFooter.vue';
import TestFormHead from '@/components/tests/form/TestFormHead.vue';
import TestQuestionEditor from '@/components/tests/question/TestQuestionEditor.vue';
import TestQuestionItem from '@/components/tests/question/TestQuestionItem.vue';
import TestTitleField from '@/components/tests/form/TestTitleField.vue';
import TestToolbar from '@/components/tests/form/TestToolbar.vue';
import { useTestForm } from '@/composables/tests/useTestForm';

const props = defineProps<{
    testId: number | null;
}>();
const { testId } = toRefs(props);

const {
    title,
    description,
    attempts,
    savedQuestions,
    editingQuestion,
    isEditing,
    isEmpty,
    savedCountLabel,
    testLink,
    listClass,
    footer,
    isLoading,
    isLoadError,
    isError,
    errorMessage,
    addQuestion,
    editQuestion,
    saveQuestion,
    cancelQuestion,
    removeQuestion,
    handleTitle,
    handleDescription,
    handleAttempts,
    handleSaveTest,
    loadTest,
} = useTestForm(testId);
</script>
