<template>
    <ProfileLayout>
        <div class="test-create">
            <header class="test-create__header">
                <div class="test-create__title">
                    <h2>Новый тест</h2>
                    <span class="test-create__subtitle">Соберите структуру теста и настройте доступ</span>
                </div>
                <a-button class="test-create__settings-btn" size="large" @click="isSettingsOpen = true">
                    <template #icon>
                        <SettingOutlined />
                    </template>
                    Настройки
                </a-button>
            </header>

            <section class="test-create__content">
                <TestSettings
                    v-model:open="isSettingsOpen"
                    :settings="settings"
                    @update:settings="onUpdateSettings"
                />

                <div class="test-create__questions">
                    <div class="test-create__questions-header">
                        <h2>Вопросы теста</h2>
                        <span class="test-create__questions-count">
                            {{ questions.length }} вопрос(ов)
                        </span>
                    </div>

                    <div v-if="questions.length === 0" class="test-create__empty">
                        <p>Пока нет ни одного вопроса.</p>
                        <a-button type="primary" size="large" @click="addQuestion">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                            Добавить вопрос
                        </a-button>
                    </div>

                    <div v-else class="test-create__questions-list">
                        <QuestionCard
                            v-for="(question, index) in questions"
                            :key="question.id"
                            :question="question"
                            :index="index"
                            :individual-checking="settings.individualChecking"
                            @update:question="onUpdateQuestion"
                            @save="onSaveQuestion"
                            @remove="onRemoveQuestion"
                        />

                        <div class="test-create__add-next">
                            <a-button type="dashed" size="large" block @click="addQuestion">
                                <template #icon>
                                    <PlusOutlined />
                                </template>
                                Добавить следующий вопрос
                            </a-button>
                        </div>
                    </div>
                </div>

                <DraftManager
                    class="test-create__drafts"
                    :drafts="drafts"
                    :max-drafts="maxDrafts"
                    @clear="onClearDrafts"
                    @manage="onManageDrafts"
                />
            </section>

            <footer class="test-create__footer">
                <div class="test-create__footer-left">
                    <a-typography-text type="secondary">
                        Перед сохранением убедитесь, что все обязательные поля заполнены.
                    </a-typography-text>
                    <a-typography-text v-if="saveError" type="danger">
                        {{ saveError }}
                    </a-typography-text>
                </div>
                <div class="test-create__footer-actions">
                    <a-button
                        v-if="copied"
                        type="default"
                        size="large"
                        :disabled="!canCopyLink"
                        @click="copyLink"
                    >
                        Ссылка скопирована
                    </a-button>
                    <a-button
                        v-else
                        type="default"
                        size="large"
                        :disabled="!canCopyLink"
                        @click="copyLink"
                    >
                        Скопировать ссылку на тест
                    </a-button>

                    <a-button type="primary" size="large" :loading="isSaving" @click="handleSaveTest">
                        <template #icon>
                            <SaveOutlined />
                        </template>
                        Сохранить тест
                    </a-button>
                </div>
            </footer>
        </div>
    </ProfileLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { PlusOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons-vue';
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import TestSettings from '@/components/tests/TestSettings.vue';
import QuestionCard from '@/components/tests/QuestionCard.vue';
import DraftManager from '@/components/tests/DraftManager.vue';
import { useTestBuilder } from '@/composables/tests/useTestBuilder';
import { useDraftTests } from '@/composables/tests/useDraftTests';
import { useValidation } from '@/composables/tests/useValidation';
import type { TestQuestion, TestSettings as TestSettingsType } from '@/types/Test';

const isSettingsOpen = ref(false);
const isSaving = ref(false);
const saveError = ref<string | null>(null);
const copied = ref(false);

const { settings, questions, addQuestion, updateQuestion, removeQuestion, buildTestPayload } = useTestBuilder();
const { drafts, maxDrafts, saveDraft, loadDrafts, clearDrafts } = useDraftTests();
const { validateTestBeforeSave } = useValidation();

const canCopyLink = computed(() => questions.value.length > 0);

const onUpdateSettings = (newSettings: TestSettingsType) => {
    settings.value = newSettings;
};

const onUpdateQuestion = (updatedQuestion: TestQuestion) => {
    updateQuestion(updatedQuestion);
};

const onSaveQuestion = (questionId: string) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (!question) return;
    // Помечаем вопрос как сохраненный в черновик
    question.isDraftSaved = true;
    // Авто-сохранение черновика теста при сохранении вопроса
    onAutoSaveDraft();
};

const onRemoveQuestion = (questionId: string) => {
    removeQuestion(questionId);
};

const onAutoSaveDraft = () => {
    const payload = buildTestPayload();
    saveDraft(payload);
};

const handleSaveTest = () => {
    saveError.value = null;
    const payload = buildTestPayload();
    const { valid, message } = validateTestBeforeSave(payload);

    if (!valid) {
        saveError.value = message ?? 'Проверьте корректность заполнения теста.';
        return;
    }

    isSaving.value = true;

    // Здесь будет вызов backend API
    setTimeout(() => {
        isSaving.value = false;
        copied.value = false;
        // После успешного сохранения можно очистить черновики или обновить их
        saveDraft(payload);
    }, 800);
};

const copyLink = async () => {
    try {
        const origin = window.location.origin;
        // В реальной интеграции здесь будет ID теста, полученный от backend
        const draftId = drafts.value[0]?.id ?? 'draft';
        const url = `${origin}/tests/${draftId}`;
        await navigator.clipboard.writeText(url);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    } catch (e) {
        console.error('Не удалось скопировать ссылку', e);
    }
};

const onClearDrafts = () => {
    clearDrafts();
};

const onManageDrafts = () => {
    // Здесь можно будет открыть отдельную страницу/модал управления черновиками
    // Пока оставляем как заглушку
};

onMounted(() => {
    loadDrafts();
    window.addEventListener('beforeunload', onAutoSaveDraft);
});

onBeforeUnmount(() => {
    onAutoSaveDraft();
    window.removeEventListener('beforeunload', onAutoSaveDraft);
});

onBeforeRouteLeave(() => {
    onAutoSaveDraft();
});
</script>


