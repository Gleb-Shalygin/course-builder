// Временные данные для вёрстки прохождения теста: заменяются на запрос к API,
// когда появится backend-эндпоинт выдачи теста по ссылке.
import { QuestionType } from '@/types/tests/Test.ts';
import type { RunnerTest } from '@/types/runner/TestRunner.ts';

const MOCK_DELAY = 600;

const mockTest: RunnerTest = {
    id: 'mock-test',
    title: 'Основы вёрстки и Vue 3',
    description:
        'Небольшой тест из шести вопросов: проверим базовые знания HTML, CSS и Composition API. Отвечать можно в любом порядке, вернуться к прошлому вопросу — тоже.',
    questions: [
        {
            id: 'q1',
            type: QuestionType.Single,
            text: 'Какой хук Composition API вызывается после монтирования компонента?',
            correctAnswerId: 'q1a2',
            answers: [
                { id: 'q1a1', text: 'onBeforeMount' },
                { id: 'q1a2', text: 'onMounted' },
                { id: 'q1a3', text: 'onUpdated' },
                { id: 'q1a4', text: 'onUnmounted' },
            ],
        },
        {
            id: 'q2',
            type: QuestionType.TrueFalse,
            text: 'Свойство computed кэширует результат до изменения зависимостей.',
            correctAnswerId: 'q2a1',
            answers: [
                { id: 'q2a1', text: 'Да' },
                { id: 'q2a2', text: 'Нет' },
            ],
        },
        {
            id: 'q3',
            type: QuestionType.Single,
            text: 'Какое CSS-свойство задаёт направление осей во flex-контейнере?',
            correctAnswerId: 'q3a3',
            answers: [
                { id: 'q3a1', text: 'align-items' },
                { id: 'q3a2', text: 'justify-content' },
                { id: 'q3a3', text: 'flex-direction' },
                { id: 'q3a4', text: 'flex-wrap' },
            ],
        },
        {
            id: 'q4',
            type: QuestionType.TrueFalse,
            text: 'Тег <section> предназначен для навигационных ссылок по сайту.',
            correctAnswerId: 'q4a2',
            answers: [
                { id: 'q4a1', text: 'Да' },
                { id: 'q4a2', text: 'Нет' },
            ],
        },
        {
            id: 'q5',
            type: QuestionType.Single,
            text: 'Что вернёт ref(0) при обращении внутри script setup?',
            correctAnswerId: 'q5a2',
            answers: [
                { id: 'q5a1', text: 'Число 0' },
                { id: 'q5a2', text: 'Объект со свойством value' },
                { id: 'q5a3', text: 'Promise с числом' },
                { id: 'q5a4', text: 'Функцию-геттер' },
            ],
        },
        {
            id: 'q6',
            type: QuestionType.TrueFalse,
            text: 'Медиазапрос min-width используется в mobile-first вёрстке.',
            correctAnswerId: 'q6a1',
            answers: [
                { id: 'q6a1', text: 'Да' },
                { id: 'q6a2', text: 'Нет' },
            ],
        },
    ],
};

export function getRunnerTestMock(testLink: string): Promise<RunnerTest> {
    return new Promise((resolve) => {
        window.setTimeout(() => {
            resolve({ ...mockTest, id: testLink });
        }, MOCK_DELAY);
    });
}
