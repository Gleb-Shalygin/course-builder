import type { QuestionType } from '@/types/tests/Test.ts';

export enum RunnerStage {
    Intro = 'intro',
    Question = 'question',
    Finish = 'finish',
    Result = 'result',
}

export interface RunnerAnswerOption {
    id: string;
    text: string;
}

/**
 * Вопрос в том виде, в каком он приходит на клиент: признака правильного
 * варианта здесь нет и быть не должно — сверка живёт на бэкенде.
 */
export interface RunnerQuestion {
    id: string;
    type: QuestionType;
    text: string;
    answers: RunnerAnswerOption[];
}

export interface RunnerTest {
    id: string;
    title: string;
    description: string | null;
    questionsCount: number;
}

/** Данные первой отрисовки страницы: приезжают пропсами Inertia, без обращения к API. */
export interface RunnerIntro {
    link: string;
    title: string;
    description: string | null;
    questionsCount: number;
}

export interface RunnerParticipant {
    firstName: string;
    lastName: string;
}

export interface RunnerResultItem {
    number: number;
    questionText: string;
    selectedText: string | null;
    correctText: string;
    isCorrect: boolean;
}

export interface RunnerResult {
    items: RunnerResultItem[];
    correctCount: number;
    totalCount: number;
    percent: number;
    title: string;
    status: 'success' | 'normal' | 'exception';
}

/** Полное состояние прохождения — единственный источник правды, приходит с бэкенда. */
export interface RunnerState {
    stage: RunnerStage;
    test: RunnerTest;
    questions: RunnerQuestion[];
    answers: Record<string, string>;
    currentQuestionId: string | null;
    participant: RunnerParticipant | null;
    result: RunnerResult | null;
}

export interface RunnerParticipantForm {
    firstName: string;
    lastName: string;
}

export interface RunnerStartRequest {
    first_name: string;
    last_name: string;
}

export interface RunnerAnswerRequest {
    question_id: number;
    answer_id: number;
}

export interface RunnerPositionRequest {
    stage: RunnerStage;
    question_id: number;
}

export interface RunnerSlide {
    number: number;
    total: number;
    question: RunnerQuestion;
    selectedAnswerId: string | null;
}

export interface RunnerNavState {
    isPrevDisabled: boolean;
    isNextDisabled: boolean;
    isLast: boolean;
    nextLabel: string;
}

/** Номер и индекс — только для отрисовки и локальной навигации, наружу уходит id. */
export interface RunnerPaginationItem {
    id: string;
    number: number;
    index: number;
    isActive: boolean;
    isAnswered: boolean;
}

export interface RunnerFinishState {
    answeredCount: number;
    totalCount: number;
    isComplete: boolean;
    hint: string;
}
