import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useTestBuilder } from '@/composables/tests/useTestBuilder';
import { useDraftTests } from '@/composables/tests/useDraftTests';
import { useValidation } from '@/composables/tests/useValidation';
import type { TestQuestion, TestSettings as TestSettingsType } from '@/types/Test';

export function useTestCreatePage() {
    // const questions = ref({
    //     settings: {
    //         access_type: '',
    //         email: 'test@mail.ru',
    //         send_results_to_email: true,
    //         teacher_reviewed: true,
    //         individual_checking: true,
    //         attempts: 99,
    //     },
    //     tests: [
    //         {
    //             id: null,
    //             question_text: 'Что такое Past Present Perfect?',
    //             type: 'single',
    //             answer: [
    //                 {
    //                     id: 1,
    //                     text: 'Да',
    //                     correct: true,
    //                 },
    //                 {
    //                     id: 2,
    //                     text: 'Нет',
    //                     correct: false,
    //                 },
    //             ],
    //             correct_answer: '',
    //         },
    //     ],
    // });

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

    const onAutoSaveDraft = () => {
        const payload = buildTestPayload();
        saveDraft(payload);
    };

    const onSaveQuestion = (questionId: string) => {
        const question = questions.value.find((q) => q.id === questionId);
        if (!question) return;

        question.isDraftSaved = true;
        onAutoSaveDraft();
    };

    const onRemoveQuestion = (questionId: string) => {
        removeQuestion(questionId);
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

        setTimeout(() => {
            isSaving.value = false;
            copied.value = false;
            saveDraft(payload);
        }, 800);
    };

    const copyLink = async () => {
        try {
            const origin = window.location.origin;
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
        // Placeholder for draft management navigation/modal.
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

    return {
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
    };
}
