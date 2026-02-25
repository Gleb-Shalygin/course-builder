<template>
    <div class="draft-manager">
        <div class="draft-manager__header">
            <span class="draft-manager__title">Черновики тестов</span>
            <span class="draft-manager__counter">
                {{ drafts.length }} / {{ maxDrafts }}
            </span>
        </div>

        <p class="draft-manager__hint">
            Черновики автоматически сохраняются при изменении вопросов и выходе со страницы.
        </p>

        <div
            v-if="drafts.length >= maxDrafts"
            class="draft-manager__actions"
        >
            <a-typography-text type="warning" class="draft-manager__warning">
                Достигнут лимит в {{ maxDrafts }} черновиков.
            </a-typography-text>
            <div class="draft-manager__buttons">
                <a-button size="small" @click="$emit('clear')">
                    Очистить черновики
                </a-button>
                <a-button size="small" type="default" @click="$emit('manage')">
                    Управление черновиками
                </a-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TestDraft } from '@/types/Test';

defineProps<{
    drafts: TestDraft[];
    maxDrafts: number;
}>();

defineEmits<{
    (e: 'clear'): void;
    (e: 'manage'): void;
}>();
</script>

<style scoped lang="scss">
.draft-manager {
    padding: 14px 16px;
    border-radius: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    &__title {
        font-size: 13px;
        font-weight: 500;
        color: #111827;
    }

    &__counter {
        font-size: 12px;
        color: #6b7280;
    }

    &__hint {
        margin: 0;
        font-size: 12px;
        color: #6b7280;
    }

    &__actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
    }

    &__warning {
        font-size: 12px;
    }

    &__buttons {
        display: flex;
        gap: 8px;
    }
}
</style>

