<template>
    <a-card class="test-title" :bordered="false">
        <a-flex vertical :gap="6">
            <span class="test-title__label">Название теста</span>

            <a-input
                class="test-title__input"
                :value="title"
                placeholder="Например: Входной тест по вёрстке"
                size="large"
                :maxlength="255"
                @update:value="handleTitle"
            />
        </a-flex>
    </a-card>
</template>

<script setup lang="ts">
interface TestTitleFieldProps {
    title: string;
}

defineProps<TestTitleFieldProps>();

const emit = defineEmits<{
    (e: 'update:title', title: string): void;
}>();

const handleTitle = (value: string): void => {
    emit('update:title', value);
};
</script>
