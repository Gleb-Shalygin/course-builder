<template>
    <ProfileLayout>
        <div class="test-create">
            <header class="test-create__header">
                <div class="test-create__title">
                    <h1>Создание теста</h1>
                    <span class="test-create__subtitle">Соберите структуру теста и настройте доступ</span>
                </div>
                <a-button type="default" shape="circle" class="test-create__settings-btn" @click="isSettingsOpen = true"> ⚙ </a-button>
            </header>

            <section class="test-create__content">
                <TestSettings v-model:open="isSettingsOpen" :settings="settings" @update:settings="onUpdateSettings" />

                <div class="test-create__questions">
                    <div class="test-create__questions-header">
                        <h2>Вопросы теста</h2>
                        <span class="test-create__questions-count"> {{ questions.length }} вопрос(ов) </span>
                    </div>

                    <div v-if="questions.length === 0" class="test-create__empty">
                        <p>Пока нет ни одного вопроса.</p>
                        <a-button type="primary" @click="addQuestion"> ➕ Добавить вопрос </a-button>
                    </div>

                    <question-card-list v-else />
                </div>

                <DraftManager class="test-create__drafts" :drafts="drafts" :max-drafts="maxDrafts" @clear="onClearDrafts" @manage="onManageDrafts" />
            </section>

            <footer class="test-create__footer">
                <div class="test-create__footer-left">
                    <a-typography-text type="secondary"> Перед сохранением убедитесь, что все обязательные поля заполнены. </a-typography-text>
                    <a-typography-text v-if="saveError" type="danger">
                        {{ saveError }}
                    </a-typography-text>
                </div>
                <div class="test-create__footer-actions">
                    <a-button v-if="copied" type="default" size="large" :disabled="!canCopyLink" @click="copyLink"> Ссылка скопирована </a-button>
                    <a-button v-else type="default" size="large" :disabled="!canCopyLink" @click="copyLink"> Скопировать ссылку на тест </a-button>

                    <a-button type="primary" size="large" @click="handleSaveTest" :loading="isSaving"> 💾 Сохранить тест </a-button>
                </div>
            </footer>
        </div>
    </ProfileLayout>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import TestSettings from '@/components/tests/TestSettings.vue';
import DraftManager from '@/components/tests/DraftManager.vue';
import { useTestCreatePage } from '@/composables/pages/useTestCreatePage';

const {
    isSettingsOpen,
    isSaving,
    saveError,
    copied,
    settings,
    questions,
    drafts,
    maxDrafts,
    canCopyLink,
    addQuestion,
    onUpdateSettings,
    onUpdateQuestion,
    onSaveQuestion,
    onRemoveQuestion,
    onClearDrafts,
    onManageDrafts,
    handleSaveTest,
    copyLink,
} = useTestCreatePage();

provide('question-list', questions);
provide('settings', settings);
provide('on-update-question', onUpdateQuestion);
provide('on-save-question', onSaveQuestion);
provide('on-remove-question', onRemoveQuestion);
provide('add-question', addQuestion);
</script>
