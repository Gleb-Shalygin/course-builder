import { ref } from 'vue';
import type { AxiosResponse } from 'axios';
import { message } from 'ant-design-vue';
import { createTestRequest, updateTestRequest } from '@/api/test';
import { useTestSaving } from '@/composables/tests/builder/useTestSaving';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';
import { makeTestPayload } from '@/test/helpers/makeTestPayload';
import type { CreatedTest } from '@/types/tests/Test';

vi.mock('@/api/test', () => ({
    createTestRequest: vi.fn(),
    updateTestRequest: vi.fn(),
}));

vi.mock('ant-design-vue', () => ({
    message: {
        success: vi.fn(),
    },
}));

const CREATED_TEST: CreatedTest = {
    id: 7,
    link: 'abc',
};

describe('useTestSaving', () => {
    beforeEach(() => {
        vi.mocked(createTestRequest).mockResolvedValue(makeAxiosResponse(CREATED_TEST));
        vi.mocked(updateTestRequest).mockResolvedValue(makeAxiosResponse(CREATED_TEST));
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('new test', () => {
        it('creates test and remembers its id', async () => {
            const payload = makeTestPayload();
            const { isSaved, savedTestId, saveTest } = useTestSaving(ref(null));

            await saveTest(payload);

            expect(createTestRequest).toHaveBeenCalledWith(payload);
            expect(updateTestRequest).not.toHaveBeenCalled();
            expect(isSaved.value).toBe(true);
            expect(savedTestId.value).toBe(7);
        });

        it('shows success message for created test', async () => {
            const { saveTest } = useTestSaving(ref(null));

            await saveTest(makeTestPayload());

            expect(message.success).toHaveBeenCalledWith('Тест сохранён');
        });

        it('shows create error when request fails', async () => {
            vi.mocked(createTestRequest).mockRejectedValue(new Error('Network down'));
            const {
                isSaved,
                isError,
                errorMessage,
                saveTest,
            } = useTestSaving(ref(null));

            await saveTest(makeTestPayload());

            expect(isError.value).toBe(true);
            expect(errorMessage.value).toBe('Не удалось сохранить тест. Попробуйте ещё раз.');
            expect(isSaved.value).toBe(false);
            expect(message.success).not.toHaveBeenCalled();
        });
    });

    describe('existing test', () => {
        it('updates test by id', async () => {
            const payload = makeTestPayload();
            const { isSaved, saveTest } = useTestSaving(ref(7));

            await saveTest(payload);

            expect(updateTestRequest).toHaveBeenCalledWith(7, payload);
            expect(createTestRequest).not.toHaveBeenCalled();
            expect(isSaved.value).toBe(true);
        });

        it('shows success message for updated test', async () => {
            const { saveTest } = useTestSaving(ref(7));

            await saveTest(makeTestPayload());

            expect(message.success).toHaveBeenCalledWith('Изменения сохранены');
        });

        it('shows update error when request fails', async () => {
            vi.mocked(updateTestRequest).mockRejectedValue(new Error('Network down'));
            const { errorMessage, saveTest } = useTestSaving(ref(7));

            await saveTest(makeTestPayload());

            expect(errorMessage.value).toBe('Не удалось сохранить изменения. Попробуйте ещё раз.');
        });

        it('uses test id current at save time', async () => {
            const testId = ref<number | null>(null);
            const payload = makeTestPayload();
            const { saveTest } = useTestSaving(testId);

            testId.value = 9;
            await saveTest(payload);

            expect(updateTestRequest).toHaveBeenCalledWith(9, payload);
        });
    });

    describe('validation', () => {
        it('does not send invalid test', async () => {
            const {
                isError,
                errorMessage,
                isSaving,
                saveTest,
            } = useTestSaving(ref(null));

            await saveTest(makeTestPayload({ title: '  ' }));

            expect(createTestRequest).not.toHaveBeenCalled();
            expect(isError.value).toBe(true);
            expect(errorMessage.value).toBe('Введите название теста.');
            expect(isSaving.value).toBe(false);
        });

        it('clears previous error after successful save', async () => {
            const { isError, errorMessage, saveTest } = useTestSaving(ref(null));
            await saveTest(makeTestPayload({ title: '' }));

            await saveTest(makeTestPayload());

            expect(isError.value).toBe(false);
            expect(errorMessage.value).toBe('');
        });
    });

    describe('isSaving', () => {
        it('is set while request is pending', async () => {
            const request = Promise.withResolvers<AxiosResponse<CreatedTest>>();
            vi.mocked(createTestRequest).mockReturnValue(request.promise);
            const { isSaving, saveTest } = useTestSaving(ref(null));

            const saving = saveTest(makeTestPayload());

            expect(isSaving.value).toBe(true);

            request.resolve(makeAxiosResponse(CREATED_TEST));
            await saving;

            expect(isSaving.value).toBe(false);
        });

        it('is reset after failed request', async () => {
            vi.mocked(createTestRequest).mockRejectedValue(new Error('Network down'));
            const { isSaving, saveTest } = useTestSaving(ref(null));

            await saveTest(makeTestPayload());

            expect(isSaving.value).toBe(false);
        });
    });
});
