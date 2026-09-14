<template>
    <a-card class="test-description" :bordered="false">
        <a-flex vertical :gap="6">
            <span class="test-description__label">Описание теста</span>

            <a-textarea
                class="test-description__input"
                :value="descriptionValue"
                placeholder="Коротко о том, что проверяет тест и как его проходить"
                :rows="3"
                :maxlength="1000"
                show-count
                @update:value="handleDescription"
            />
        </a-flex>
    </a-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';

interface TestDescriptionFieldProps {
    description: string | null;
}

const props = defineProps<TestDescriptionFieldProps>();
const { description } = toRefs(props);

const emit = defineEmits<{
    (e: 'update:description', description: string): void;
}>();

const descriptionValue = computed((): string => description.value ?? '');

const handleDescription = (value: string): void => {
    emit('update:description', value);
};
</script>
