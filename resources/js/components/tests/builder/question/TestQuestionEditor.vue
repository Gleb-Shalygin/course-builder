<template>
    <a-card class="question-editor" :bordered="false">
        <a-flex class="question-editor__head" align="center" justify="space-between" :gap="8">
            <span class="question-editor__title">Вопрос</span>
            <a-tag class="question-editor__badge" color="processing">Не сохранён</a-tag>
        </a-flex>

        <a-segmented
            class="question-editor__types"
            :value="draft.type"
            :options="typeOptions"
            size="large"
            block
            @change="setType"
        />

        <a-textarea
            v-model:value="draft.text"
            class="question-editor__text"
            placeholder="Введите текст вопроса"
            size="large"
            :rows="3"
            :maxlength="500"
            show-count
        />

        <span class="question-editor__hint">{{ answersHint }}</span>

        <TestAnswersEditor
            class="question-editor__answers"
            :answers="draft.answers"
            :editable="isAnswersEditable"
            @update:answers="setAnswers"
        />

        <a-alert
            v-if="isError"
            class="question-editor__error"
            type="error"
            :message="errorMessage"
            show-icon
        />

        <a-flex class="question-editor__actions" :gap="8" wrap="wrap">
            <a-button class="question-editor__save" type="primary" size="large" @click="handleSave">
                <template #icon>
                    <CheckOutlined />
                </template>
                Сохранить вопрос
            </a-button>

            <a-button size="large" @click="handleCancel">Отмена</a-button>
        </a-flex>
    </a-card>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { CheckOutlined } from '@ant-design/icons-vue';
import TestAnswersEditor from '@/components/tests/builder/question/TestAnswersEditor.vue';
import { useQuestionEditor } from '@/composables/tests/builder/useQuestionEditor';
import type { TestQuestion } from '@/types/tests/Test';

interface TestQuestionEditorProps {
    question: TestQuestion;
}

const props = defineProps<TestQuestionEditorProps>();
const { question } = toRefs(props);

const emit = defineEmits<{
    (e: 'save', question: TestQuestion): void;
    (e: 'cancel', questionId: string): void;
}>();

const {
    draft,
    errorMessage,
    typeOptions,
    isAnswersEditable,
    isError,
    answersHint,
    setType,
    setAnswers,
    validate,
} = useQuestionEditor(question);

const handleSave = (): void => {
    if (!validate()) return;

    emit('save', draft.value);
};

const handleCancel = (): void => {
    emit('cancel', draft.value.id);
};
</script>
