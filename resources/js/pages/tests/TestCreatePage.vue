<template>
    <ProfileLayout>
        <div class="test-create">
            <TestCreateHeader @open-settings="isSettingsOpen = true" />

            <TestCreateContent
                :is-settings-open="isSettingsOpen"
                :settings="settings"
                :questions="questions"
                :drafts="drafts"
                :max-drafts="maxDrafts"
                @update:is-settings-open="isSettingsOpen = $event"
                @update:settings="onUpdateSettings"
                @add-question="addQuestion"
                @clear-drafts="onClearDrafts"
                @manage-drafts="onManageDrafts"
            />

            <TestCreateFooter
                :save-error="saveError"
                :copied="copied"
                :can-copy-link="canCopyLink"
                :is-saving="isSaving"
                @copy-link="copyLink"
                @save-test="handleSaveTest"
            />
        </div>
    </ProfileLayout>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import TestCreateHeader from '@/components/tests/create/TestCreateHeader.vue';
import TestCreateContent from '@/components/tests/create/TestCreateContent.vue';
import TestCreateFooter from '@/components/tests/create/TestCreateFooter.vue';
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
