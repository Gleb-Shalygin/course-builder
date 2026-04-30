<template>
    <section class="test-create__content">
        <TestSettings :open="isSettingsOpen" :settings="settings" @update:open="$emit('update:is-settings-open', $event)" @update:settings="$emit('update:settings', $event)" />

        <div class="test-create__questions">
            <div class="test-create__questions-header">
                <h2>Вопросы теста</h2>
                <span class="test-create__questions-count"> {{ questions.length }} вопрос(ов) </span>
            </div>

            <div v-if="questions.length === 0" class="test-create__empty">
                <p>Пока нет ни одного вопроса.</p>
                <a-button type="primary" @click="$emit('add-question')"> ➕ Добавить вопрос </a-button>
            </div>

            <question-card-list v-else />
        </div>

        <DraftManager class="test-create__drafts" :drafts="drafts" :max-drafts="maxDrafts" @clear="$emit('clear-drafts')" @manage="$emit('manage-drafts')" />
    </section>
</template>

<script setup lang="ts">
import DraftManager from '@/components/tests/DraftManager.vue';
import TestSettings from '@/components/tests/TestSettings.vue';
import type { TestDraft, TestQuestion, TestSettings as TestSettingsModel } from '@/types/Test';

defineProps<{
    isSettingsOpen: boolean;
    settings: TestSettingsModel;
    questions: TestQuestion[];
    drafts: TestDraft[];
    maxDrafts: number;
}>();

defineEmits<{
    (e: 'update:is-settings-open', value: boolean): void;
    (e: 'update:settings', value: TestSettingsModel): void;
    (e: 'add-question'): void;
    (e: 'clear-drafts'): void;
    (e: 'manage-drafts'): void;
}>();
</script>
