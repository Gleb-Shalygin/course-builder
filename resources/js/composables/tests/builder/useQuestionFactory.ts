import { QuestionType } from '@/types/tests/Test';
import type { AnswerOption, TestQuestion } from '@/types/tests/Test';

const DEFAULT_ANSWERS_COUNT = 2;

function createId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useQuestionFactory() {
    function createAnswer(text = ''): AnswerOption {
        return {
            id: createId(),
            text,
            isCorrect: false,
        };
    }
    function createEmptyAnswers(): AnswerOption[] {
        return Array.from({ length: DEFAULT_ANSWERS_COUNT }, () => createAnswer());
    }
    function createBooleanAnswers(): AnswerOption[] {
        return [
            { ...createAnswer('Да'), isCorrect: true },
            createAnswer('Нет'),
        ];
    }
    function createQuestion(): TestQuestion {
        return {
            id: createId(),
            type: QuestionType.Single,
            text: '',
            answers: createEmptyAnswers(),
            isSaved: false,
        };
    }
    function cloneQuestion(question: TestQuestion): TestQuestion {
        return {
            ...question,
            answers: question.answers.map((answer) => ({ ...answer })),
        };
    }

    return {
        createAnswer,
        createEmptyAnswers,
        createBooleanAnswers,
        createQuestion,
        cloneQuestion,
    };
}
