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

export interface RunnerQuestion {
    id: string;
    type: QuestionType;
    text: string;
    answers: RunnerAnswerOption[];
    correctAnswerId: string;
}

export interface RunnerTest {
    id: string;
    title: string;
    description: string | null;
    questions: RunnerQuestion[];
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

export interface RunnerPaginationItem {
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
