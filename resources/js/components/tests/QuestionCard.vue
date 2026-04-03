<template>
    <div class="question-card">
        <div class="question-card__header">
            <div class="question-card__title-wrap">
                <span class="question-card__index">Вопрос {{ index + 1 }}</span>
                <a-badge v-if="question.isDraftSaved" status="success" text="Черновик сохранён" />
            </div>

            <a-space>
                <a-select v-model:value="question.type" size="small" class="question-card__type-select" @change="handleTypeChange">
                    <a-select-option value="single">Один правильный ответ</a-select-option>
                    <a-select-option value="multiple">Несколько правильных ответов</a-select-option>
                    <a-select-option value="open">Открытый вопрос</a-select-option>
                    <a-select-option value="match">Соответствие</a-select-option>
                    <a-select-option value="true_false">Верно / Неверно</a-select-option>
                </a-select>

                <a-button type="text" danger size="small" @click="emitRemove"> Удалить </a-button>
            </a-space>
        </div>

        <div class="question-card__body">
            <div class="question-card__field">
                <div class="question-card__label">
                    Текст вопроса
                    <span class="question-card__required">*</span>
                </div>
                <a-textarea v-model:value="question.text" rows="3" placeholder="Введите текст вопроса" />
            </div>

            <div v-if="question.type !== 'open'" class="question-card__field">
                <AnswersBlock v-model:answers="question.answers" :question-type="question.type" :individual-checking="individualChecking" />
            </div>

            <div v-else class="question-card__field">
                <div class="question-card__label">Правильный ответ (опционально)</div>
                <a-input v-model:value="question.correctText" placeholder="Укажите ожидаемый правильный ответ" />
            </div>

            <div class="question-card__field">
                <div class="question-card__label">
                    Изображение (опционально)
                    <span class="question-card__hint">до 2MB, с возможностью кропа</span>
                </div>
                <div class="question-card__upload">
                    <a-upload :before-upload="handleBeforeUpload" :show-upload-list="false">
                        <a-button size="small">Загрузить изображение</a-button>
                    </a-upload>

                    <div v-if="previewUrl" class="question-card__image-preview">
                        <div class="question-card__image-wrapper">
                            <img :src="previewUrl" alt="Превью изображения" />
                        </div>
                        <div class="question-card__image-actions">
                            <a-button type="link" size="small" @click="isCropOpen = true"> Обрезать </a-button>
                            <a-button type="link" danger size="small" @click="removeImage"> Удалить </a-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="question-card__footer">
            <a-typography-text v-if="error" type="danger" class="question-card__error">
                {{ error }}
            </a-typography-text>

            <a-space>
                <a-button type="primary" @click="handleSave"> Сохранить вопрос </a-button>
            </a-space>
        </div>

        <a-modal v-model:open="isCropOpen" title="Кроп изображения" ok-text="Применить" cancel-text="Отмена" @ok="isCropOpen = false">
            <div class="question-card__crop-area">
                <div class="question-card__crop-frame">
                    <img v-if="previewUrl" :src="previewUrl" alt="Кроп изображения" />
                </div>
                <p class="question-card__crop-hint">В реальной интеграции здесь будет полноценный инструмент кропа изображения.</p>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import AnswersBlock from '@/components/tests/AnswersBlock.vue';
import { AnswerOption, QuestionType, TestQuestion } from '@/types/Test';
import { useValidation } from '@/composables/tests/useValidation';

const props = defineProps<{
    question: TestQuestion;
    index: number;
    individualChecking: boolean;
}>();

const emitRemove = () => inject('on-remove-question');
const emitSave = () => inject('on-remove-question');
const emitUpdate = (p: {
    id: string;
    type: QuestionType;
    text: string;
    answers: AnswerOption[];
    correctText?: string;
    imageUrl?: string;
    imageFile?: File | null;
    isDraftSaved?: boolean;
}) => inject('on-update-question');

// const emit = defineEmits<{
//     (e: 'update:question', question: TestQuestion): void;
//     (e: 'save', id: string): void;
//     (e: 'remove', id: string): void;
// }>();

const { validateQuestion } = useValidation();

const isCropOpen = ref(false);
const error = ref<string | null>(null);

const previewUrl = computed(() => {
    if (props.question.imageUrl) return props.question.imageUrl;
    if (props.question.imageFile) {
        return URL.createObjectURL(props.question.imageFile);
    }
    return null;
});

watch(
    () => props.question,
    (next) => {
        emitUpdate({ ...next });
    },
    { deep: true },
);

const handleBeforeUpload = (file: File) => {
    const isTooLarge = file.size / 1024 / 1024 > 2;
    if (isTooLarge) {
        error.value = 'Размер файла не должен превышать 2MB.';
        return false;
    }

    props.question.imageFile = file;
    error.value = null;
    return false;
};

const removeImage = () => {
    props.question.imageFile = null;
    props.question.imageUrl = undefined;
};

const handleTypeChange = () => {
    if (props.question.type === 'true_false') {
        props.question.answers = [
            { id: 'true', text: 'Верно', isCorrect: true },
            { id: 'false', text: 'Неверно', isCorrect: false },
        ];
    } else if (props.question.type === 'open') {
        props.question.answers = [];
    } else if (!props.question.answers || props.question.answers.length === 0) {
        props.question.answers = [];
    }
};

const handleSave = () => {
    const result = validateQuestion(props.question, props.individualChecking);
    if (!result.valid) {
        error.value = result.message ?? 'Проверьте корректность вопроса.';
        return;
    }
    error.value = null;
    emitSave(props.question.id);
};
</script>
