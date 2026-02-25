export type TestAccessType = 'private' | 'link' | 'cabinet';

export enum QuestionType {
    Single = 'single',
    Multiple = 'multiple',
    Open = 'open',
    Match = 'match',
    TrueFalse = 'true_false',
}

export interface AnswerOption {
    id: string;
    text: string;
    isCorrect: boolean;
    matchText?: string;
}

export interface TestQuestion {
    id: string;
    type: QuestionType;
    text: string;
    answers: AnswerOption[];
    correctText?: string;
    imageUrl?: string;
    imageFile?: File | null;
    isDraftSaved?: boolean;
}

export interface TestSettings {
    accessType: TestAccessType;
    email: string;
    sendResultsToEmail: boolean;
    teacherReviewed: boolean;
    individualChecking: boolean;
    attempts: number;
}

export interface TestPayload {
    settings: TestSettings;
    questions: TestQuestion[];
}

export interface TestDraft extends TestPayload {
    id: string;
    createdAt: string;
    updatedAt: string;
}

