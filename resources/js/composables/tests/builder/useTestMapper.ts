import { QuestionType } from '@/types/tests/Test';
import type { AnswerOption, TestDetail, TestDetailAnswer, TestDetailQuestion, TestPayload, TestQuestion } from '@/types/tests/Test';

const QUESTION_TYPES: string[] = Object.values(QuestionType);

function isQuestionType(value: unknown): value is QuestionType {
    return typeof value === 'string' && QUESTION_TYPES.includes(value);
}

export function useTestMapper() {
    function toAnswer(answer: TestDetailAnswer): AnswerOption {
        return {
            id: String(answer.id),
            text: String(answer.text ?? ''),
            isCorrect: Boolean(answer.is_correct),
        };
    }
    function toQuestion(question: TestDetailQuestion): TestQuestion | null {
        if (!isQuestionType(question.type) || !Array.isArray(question.answers)) return null;

        return {
            id: String(question.id),
            type: question.type,
            text: String(question.text ?? ''),
            answers: question.answers.map((answer) => toAnswer(answer)),
            isSaved: true,
        };
    }
    function toTestPayload(detail: TestDetail): TestPayload | null {
        if (typeof detail.title !== 'string' || !Array.isArray(detail.questions)) return null;

        const questions = detail.questions.map((question) => toQuestion(question));

        if (questions.some((question) => question === null)) return null;

        return {
            title: detail.title,
            description: detail.description ?? null,
            attempts: Number(detail.attempts),
            questions: questions.filter((question): question is TestQuestion => question !== null),
        };
    }

    return {
        toAnswer,
        toQuestion,
        toTestPayload,
    };
}
