<template>
    <footer class="test-create__footer">
        <div class="test-create__footer-left">
            <a-typography-text type="secondary"> Перед сохранением убедитесь, что все обязательные поля заполнены. </a-typography-text>
            <a-typography-text v-if="saveError" type="danger">
                {{ saveError }}
            </a-typography-text>
        </div>
        <div class="test-create__footer-actions">
            <a-button v-if="copied" type="default" size="large" :disabled="!canCopyLink" @click="$emit('copy-link')"> Ссылка скопирована </a-button>
            <a-button v-else type="default" size="large" :disabled="!canCopyLink" @click="$emit('copy-link')"> Скопировать ссылку на тест </a-button>

            <a-button type="primary" size="large" :loading="isSaving" @click="$emit('save-test')"> 💾 Сохранить тест </a-button>
        </div>
    </footer>
</template>

<script setup lang="ts">
defineProps<{
    saveError: string | null;
    copied: boolean;
    canCopyLink: boolean;
    isSaving: boolean;
}>();

defineEmits<{
    (e: 'copy-link'): void;
    (e: 'save-test'): void;
}>();
</script>
