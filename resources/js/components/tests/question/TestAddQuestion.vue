<template>
    <a-flex class="test-add" vertical align="center" :gap="8">
        <a-button
            class="test-add__button"
            :class="buttonClass"
            type="dashed"
            size="large"
            block
            :disabled="disabled"
            @click="handleAdd"
        >
            <template #icon>
                <PlusOutlined class="test-add__icon" />
            </template>
            {{ buttonLabel }}
        </a-button>

        <a-typography-text v-if="disabled" class="test-add__hint" type="secondary">
            Сначала сохраните текущий вопрос
        </a-typography-text>
    </a-flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';

interface TestAddQuestionProps {
    disabled: boolean;
    isFirst: boolean;
}

const props = defineProps<TestAddQuestionProps>();

const emit = defineEmits<{
    (e: 'add'): void;
}>();

const buttonClass = computed((): string => (props.disabled ? 'test-add__button--locked' : ''));
const buttonLabel = computed((): string => (props.isFirst ? 'Добавить первый вопрос' : 'Добавить вопрос'));

const handleAdd = (): void => {
    emit('add');
};
</script>
