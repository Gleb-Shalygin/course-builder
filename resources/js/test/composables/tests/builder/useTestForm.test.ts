import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import type { App } from 'vue';
import type { AxiosResponse } from 'axios';
import { router } from '@inertiajs/vue3';
import { createTestRequest, getTestRequest, updateTestRequest } from '@/api/test';
import { useTestForm } from '@/composables/tests/builder/useTestForm';
import { useTestMapper } from '@/composables/tests/builder/useTestMapper';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';
import { makeTestDetail } from '@/test/helpers/makeTestDetail';
import { makeTestQuestion } from '@/test/helpers/makeTestQuestion';
import { withSetup } from '@/test/helpers/withSetup';
import type { CreatedTest, TestDetail } from '@/types/tests/Test';

vi.mock('@/api/test', () => ({
    getTestRequest: vi.fn(),
    createTestRequest: vi.fn(),
    updateTestRequest: vi.fn(),
}));

vi.mock('ant-design-vue', () => ({
    message: {
        success: vi.fn(),
    },
}));

vi.mock('@inertiajs/vue3', () => ({
    router: {
        visit: vi.fn(),
    },
}));

const TEST_ID = 5;
const CREATED_TEST: CreatedTest = {
    id: TEST_ID,
    link: 'abc',
};

describe('useTestForm', () => {
    let app: App | null = null;

    async function setup(testId: number | null = null) {
        const [form, mounted] = withSetup(() => useTestForm(ref(testId)));
        app = mounted;
        await flushPromises();

        return form;
    }

    function addSavedQuestion(form: Awaited<ReturnType<typeof setup>>): void {
        form.addQuestion();
        form.saveQuestion(makeTestQuestion({ id: form.editingQuestion.value?.id }));
    }

    beforeEach(() => {
        vi.mocked(getTestRequest).mockResolvedValue(makeAxiosResponse(makeTestDetail({ id: TEST_ID, link: 'abc' })));
        vi.mocked(createTestRequest).mockResolvedValue(makeAxiosResponse(CREATED_TEST));
        vi.mocked(updateTestRequest).mockResolvedValue(makeAxiosResponse(CREATED_TEST));
    });

    afterEach(() => {
        app?.unmount();
        app = null;
        vi.resetAllMocks();
    });

    describe('new test', () => {
        it('starts with empty form without loading', async () => {
            const {
                title,
                isEmpty,
                testLink,
                footer,
            } = await setup();

            expect(getTestRequest).not.toHaveBeenCalled();
            expect(title.value).toBe('');
            expect(isEmpty.value).toBe(true);
            expect(testLink.value).toBeNull();
            expect(footer.value).toEqual({ label: 'Сохранить тест', isSaving: false, isDisabled: false });
        });

        it('creates test from form fields and opens tests list', async () => {
            const form = await setup();
            form.handleTitle('География');
            form.handleDescription('Столицы мира');
            form.handleAttempts(3);
            addSavedQuestion(form);

            await form.handleSaveTest();

            expect(createTestRequest).toHaveBeenCalledWith({
                title: 'География',
                description: 'Столицы мира',
                attempts: 3,
                questions: [makeTestQuestion({ id: expect.any(String), isSaved: true })],
            });
            expect(router.visit).toHaveBeenCalledWith('/profile/tests');
        });

        it('stays on form when test is invalid', async () => {
            const {
                isError,
                errorMessage,
                handleSaveTest,
            } = await setup();

            await handleSaveTest();

            expect(createTestRequest).not.toHaveBeenCalled();
            expect(router.visit).not.toHaveBeenCalled();
            expect(isError.value).toBe(true);
            expect(errorMessage.value).toBe('Введите название теста.');
        });

        it('stays on form when saving fails', async () => {
            vi.mocked(createTestRequest).mockRejectedValue(new Error('Network down'));
            const form = await setup();
            form.handleTitle('География');
            addSavedQuestion(form);

            await form.handleSaveTest();

            expect(router.visit).not.toHaveBeenCalled();
            expect(form.errorMessage.value).toBe('Не удалось сохранить тест. Попробуйте ещё раз.');
        });

        it('does not save question that is still edited', async () => {
            const form = await setup();
            form.handleTitle('География');
            form.addQuestion();

            await form.handleSaveTest();

            expect(createTestRequest).not.toHaveBeenCalled();
            expect(form.errorMessage.value).toBe('Добавьте минимум один вопрос в тест.');
        });
    });

    describe('existing test', () => {
        it('fills form with loaded test', async () => {
            const {
                title,
                attempts,
                savedQuestions,
                testLink,
                footer,
            } = await setup(TEST_ID);

            expect(getTestRequest).toHaveBeenCalledWith(TEST_ID);
            expect(title.value).toBe('Арифметика');
            expect(attempts.value).toBe(1);
            expect(savedQuestions.value.map((question) => question.persistedId)).toEqual([10]);
            expect(testLink.value).toBe('abc');
            expect(footer.value).toEqual({ label: 'Сохранить', isSaving: false, isDisabled: false });
        });

        it('updates loaded test and opens tests list', async () => {
            const { toTestPayload } = useTestMapper();
            const { handleSaveTest } = await setup(TEST_ID);

            await handleSaveTest();

            expect(updateTestRequest).toHaveBeenCalledWith(TEST_ID, toTestPayload(makeTestDetail({ id: TEST_ID })));
            expect(router.visit).toHaveBeenCalledWith('/profile/tests');
        });

        it('disables submit while test is loading', async () => {
            const request = Promise.withResolvers<AxiosResponse<TestDetail>>();
            vi.mocked(getTestRequest).mockReturnValue(request.promise);
            const { footer } = await setup(TEST_ID);

            expect(footer.value.isDisabled).toBe(true);

            request.resolve(makeAxiosResponse(makeTestDetail()));
            await flushPromises();

            expect(footer.value.isDisabled).toBe(false);
        });

        it('shows load error and disables submit', async () => {
            vi.mocked(getTestRequest).mockRejectedValue(new Error('Network down'));
            const {
                isLoadError,
                isError,
                errorMessage,
                footer,
            } = await setup(TEST_ID);

            expect(isLoadError.value).toBe(true);
            expect(isError.value).toBe(true);
            expect(errorMessage.value).toBe('Не удалось загрузить тест. Попробуйте ещё раз.');
            expect(footer.value.isDisabled).toBe(true);
        });

        it('fills form after successful reload', async () => {
            vi.mocked(getTestRequest).mockRejectedValueOnce(new Error('Network down'));
            const {
                title,
                isError,
                loadTest,
            } = await setup(TEST_ID);

            await loadTest();

            expect(isError.value).toBe(false);
            expect(title.value).toBe('Арифметика');
        });
    });

    describe('handleDescription', () => {
        it('stores blank description as null', async () => {
            const { description, handleDescription } = await setup();

            handleDescription('   ');

            expect(description.value).toBeNull();
        });

        it('keeps filled description as is', async () => {
            const { description, handleDescription } = await setup();

            handleDescription(' Столицы мира ');

            expect(description.value).toBe(' Столицы мира ');
        });
    });

    describe('listClass', () => {
        it('locks list while question is edited', async () => {
            const { listClass, addQuestion } = await setup();

            addQuestion();

            expect(listClass.value).toBe('test-form__list--locked');
        });

        it('unlocks list after question is saved', async () => {
            const form = await setup();

            addSavedQuestion(form);

            expect(form.listClass.value).toBe('');
        });
    });
});
