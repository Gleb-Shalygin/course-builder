<template>
    <header class="test-create__header">
        <div class="test-create__title">
            <h1>Создание теста</h1>
            <span class="test-create__subtitle">Соберите структуру теста и настройте доступ</span>
        </div>
        <a-button type="default" shape="circle" class="test-create__settings-btn" @click="$emit('open-settings')"> ⚙ </a-button>
    </header>
</template>

<script setup lang="ts">
defineEmits<{
    (e: 'open-settings'): void;
}>();
</script>
