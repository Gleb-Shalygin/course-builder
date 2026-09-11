<template>
    <ProfileLayout>
        <a-flex class="test-create" vertical :gap="16">
            <a-flex class="test-create__head" align="center" justify="space-between" wrap="wrap" :gap="8">
                <h2 class="test-create__title">Новый тест</h2>
                <a-tag class="test-create__counter" color="blue">{{ savedCountLabel }}</a-tag>
            </a-flex>

            <TestTitleField :title="title" @update:title="handleTitle" />

            <TestToolbar
                :attempts="attempts"
                :test-id="savedTestId"
                @update:attempts="handleAttempts"
            />

            <a-empty
                v-if="isEmpty"
                class="test-create__empty"
                description="Пока ни одного вопроса — начните с плюсика ниже"
            />

            <transition-group
                name="question"
                tag="div"
                class="test-create__list"
                :class="listClass"
            >
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
                <TestQuestionEditor
                    v-if="editingQuestion"
                    :question="editingQuestion"
                    @save="saveQuestion"
                    @cancel="cancelQuestion"
                />
            </transition>

            <TestAddQuestion :disabled="isEditing" :is-first="isEmpty" @add="addQuestion" />

            <a-alert
                v-if="isError"
                class="test-create__error"
                type="error"
                :message="errorMessage"
                show-icon
            />

            <a-button
                class="test-create__submit"
                type="primary"
                size="large"
                block
                :loading="isSaving"
                @click="handleSaveTest"
            >
                <template #icon>
                    <SaveOutlined />
                </template>
                Сохранить тест
            </a-button>
        </a-flex>
    </ProfileLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SaveOutlined } from '@ant-design/icons-vue';
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import TestAddQuestion from '@/components/tests/TestAddQuestion.vue';
import TestQuestionEditor from '@/components/tests/TestQuestionEditor.vue';
import TestQuestionItem from '@/components/tests/TestQuestionItem.vue';
import TestTitleField from '@/components/tests/TestTitleField.vue';
import TestToolbar from '@/components/tests/TestToolbar.vue';
import { useTestBuilder } from '@/composables/tests/useTestBuilder';
import { useTestSaving } from '@/composables/tests/useTestSaving';

const {
    title,
    attempts,
    savedQuestions,
    editingQuestion,
    isEditing,
    isEmpty,
    savedCountLabel,
    addQuestion,
    editQuestion,
    saveQuestion,
    cancelQuestion,
    removeQuestion,
    buildTestPayload,
} = useTestBuilder();

const { isSaving, isError, errorMessage, savedTestId, saveTest } = useTestSaving();

const listClass = computed((): string => (isEditing.value ? 'test-create__list--locked' : ''));

const handleTitle = (value: string): void => {
    title.value = value;
};

const handleAttempts = (value: number): void => {
    attempts.value = value;
};

const handleSaveTest = async (): Promise<void> => {
    await saveTest(buildTestPayload());
};
</script>
