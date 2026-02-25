<template>
    <div class="answers">
        <div class="answers__header">
            <span class="answers__title">Варианты ответов</span>
            <span class="answers__hint" v-if="individualChecking">
                Отметьте правильный(е) ответ(ы)
            </span>
        </div>

        <div class="answers__list">
            <div
                v-for="answer in internalAnswers"
                :key="answer.id"
                class="answers__item"
            >
                <div class="answers__item-main">
                    <template v-if="questionType === 'match'">
                        <a-input
                            v-model:value="answer.text"
                            placeholder="Левая часть"
                            class="answers__input"
                            @change="emitChange"
                        />
                        <span class="answers__divider">⇄</span>
                        <a-input
                            v-model:value="answer.matchText"
                            placeholder="Правая часть"
                            class="answers__input"
                            @change="emitChange"
                        />
                    </template>
                    <template v-else>
                        <a-input
                            v-model:value="answer.text"
                            placeholder="Текст варианта ответа"
                            class="answers__input"
                            @change="emitChange"
                        />
                    </template>
                </div>

                <div class="answers__item-controls">
                    <a-checkbox
                        v-if="questionType === 'multiple' || questionType === 'match'"
                        v-model:checked="answer.isCorrect"
                        @change="handleToggleCorrect(answer.id, answer.isCorrect)"
                    >
                        Правильный
                    </a-checkbox>

                    <a-radio
                        v-else
                        :checked="answer.isCorrect"
                        @change="handleSetSingleCorrect(answer.id)"
                    >
                        Правильный
                    </a-radio>

                    <a-button
                        type="text"
                        danger
                        size="small"
                        @click="removeAnswer(answer.id)"
                    >
                        Удалить
                    </a-button>
                </div>
            </div>
        </div>

        <a-button
            v-if="canAdd"
            type="dashed"
            size="small"
            @click="addAnswer"
        >
            ➕ Добавить вариант
        </a-button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AnswerOption, QuestionType } from '@/types/Test';

const props = defineProps<{
    answers: AnswerOption[];
    questionType: QuestionType | 'single' | 'multiple' | 'open' | 'match' | 'true_false';
    individualChecking: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:answers', value: AnswerOption[]): void;
}>();

const internalAnswers = computed({
    get: () => props.answers,
    set: (value: AnswerOption[]) => emit('update:answers', value),
});

const canAdd = computed(() => props.questionType === 'single' || props.questionType === 'multiple' || props.questionType === 'match');

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const emitChange = () => {
    emit('update:answers', [...internalAnswers.value]);
};

const addAnswer = () => {
    const base: AnswerOption = {
        id: createId(),
        text: '',
        isCorrect: false,
    };

    if (props.questionType === 'match') {
        base.matchText = '';
    }

    emit('update:answers', [...internalAnswers.value, base]);
};

const removeAnswer = (id: string) => {
    emit('update:answers', internalAnswers.value.filter((a) => a.id !== id));
};

const handleToggleCorrect = (id: string, value: boolean) => {
    emit(
        'update:answers',
        internalAnswers.value.map((a) => (a.id === id ? { ...a, isCorrect: value } : a))
    );
};

const handleSetSingleCorrect = (id: string) => {
    emit(
        'update:answers',
        internalAnswers.value.map((a) => ({ ...a, isCorrect: a.id === id }))
    );
};
</script>

<style scoped lang="scss">
.answers {
    display: flex;
    flex-direction: column;
    gap: 12px;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__title {
        font-size: 13px;
        font-weight: 500;
        color: #111827;
    }

    &__hint {
        font-size: 12px;
        color: #6b7280;
    }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    &__item {
        padding: 10px 12px;
        border-radius: 8px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    &__item-main {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &__item-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    &__input {
        flex: 1;
    }

    &__divider {
        font-size: 12px;
        color: #9ca3af;
    }
}
</style>

