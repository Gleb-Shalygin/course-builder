<template>
    <a-card class="question-item" :bordered="false">
        <a-flex class="question-item__head" align="center" justify="space-between" :gap="8">
            <a-tag class="question-item__number" color="blue">Вопрос {{ number }}</a-tag>
            <a-tag class="question-item__type">{{ typeLabel }}</a-tag>
        </a-flex>

        <p class="question-item__text">{{ questionText }}</p>

        <a-flex v-if="isAnswersVisible" class="question-item__answers" vertical :gap="6">
            <a-flex
                v-for="answer in visibleAnswers"
                :key="answer.id"
                class="question-item__answer"
                align="center"
                :gap="8"
            >
                <CheckCircleFilled
                    v-if="isCorrectAnswer(answer)"
                    class="question-item__icon question-item__icon--correct"
                />
                <MinusCircleOutlined v-else class="question-item__icon" />

                <span class="question-item__answer-text">{{ answer.text }}</span>
            </a-flex>
        </a-flex>

        <a-flex class="question-item__actions" :gap="4" wrap="wrap">
            <a-button class="question-item__action question-item__action--edit" type="link" @click="handleEdit">
                <template #icon>
                    <EditOutlined />
                </template>
                Изменить
            </a-button>

            <a-popconfirm
                title="Удалить этот вопрос?"
                ok-text="Удалить"
                cancel-text="Отмена"
                @confirm="handleRemove"
            >
                <a-button class="question-item__action question-item__action--danger" type="link" danger>
                    <template #icon>
                        <DeleteOutlined />
                    </template>
                    Удалить
                </a-button>
            </a-popconfirm>
        </a-flex>
    </a-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import {
    CheckCircleFilled,
    DeleteOutlined,
    EditOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons-vue';
import { useQuestionView } from '@/composables/tests/builder/useQuestionView';
import type { TestQuestion } from '@/types/tests/Test';

interface TestQuestionItemProps {
    question: TestQuestion;
    index: number;
}

const props = defineProps<TestQuestionItemProps>();
const { question } = toRefs(props);

const emit = defineEmits<{
    (e: 'edit', questionId: string): void;
    (e: 'remove', questionId: string): void;
}>();

const { typeLabel, questionText, visibleAnswers, isAnswersVisible, isCorrectAnswer } = useQuestionView(question);

const number = computed((): number => props.index + 1);

const handleEdit = (): void => {
    emit('edit', props.question.id);
};

const handleRemove = (): void => {
    emit('remove', props.question.id);
};
</script>
