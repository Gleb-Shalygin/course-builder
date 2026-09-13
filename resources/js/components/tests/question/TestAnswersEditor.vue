<template>
    <a-flex class="test-answers" vertical :gap="10">
        <a-radio-group class="test-answers__group" :value="correctAnswerId" @change="handleSelect">
            <a-flex
                v-for="answer in answers"
                :key="answer.id"
                class="test-answers__row"
                align="center"
                :gap="8"
            >
                <a-radio class="test-answers__radio" :value="answer.id" />

                <a-input
                    v-if="editable"
                    class="test-answers__input"
                    :value="answer.text"
                    placeholder="Вариант ответа"
                    size="large"
                    @update:value="(value: string) => handleText(answer.id, value)"
                />
                <span v-else class="test-answers__label">{{ answer.text }}</span>

                <a-button
                    v-if="isRemoveVisible"
                    class="test-answers__remove"
                    type="text"
                    danger
                    size="large"
                    @click="handleRemove(answer.id)"
                >
                    <template #icon>
                        <DeleteOutlined />
                    </template>
                </a-button>
            </a-flex>
        </a-radio-group>

        <a-button v-if="isAddVisible" class="test-answers__add" type="link" @click="handleAdd">
            <template #icon>
                <PlusOutlined />
            </template>
            Добавить вариант
        </a-button>
    </a-flex>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import type { RadioChangeEvent } from 'ant-design-vue';
import { useAnswersEditor } from '@/composables/tests/useAnswersEditor';
import type { AnswerOption } from '@/types/Test';

interface TestAnswersEditorProps {
    answers: AnswerOption[];
    editable: boolean;
}

const props = defineProps<TestAnswersEditorProps>();
const { answers, editable } = toRefs(props);

const emit = defineEmits<{
    (e: 'update:answers', answers: AnswerOption[]): void;
}>();

const {
    correctAnswerId,
    isAddVisible,
    isRemoveVisible,
    withNewAnswer,
    withoutAnswer,
    withAnswerText,
    withCorrectAnswer,
} = useAnswersEditor(answers, editable);

const handleAdd = (): void => {
    emit('update:answers', withNewAnswer());
};

const handleRemove = (answerId: string): void => {
    emit('update:answers', withoutAnswer(answerId));
};

const handleText = (answerId: string, text: string): void => {
    emit('update:answers', withAnswerText(answerId, text));
};

const handleSelect = (event: RadioChangeEvent): void => {
    emit('update:answers', withCorrectAnswer(String(event.target.value)));
};
</script>
