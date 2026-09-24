export enum QuestionType {
    Single = 'single',
    TrueFalse = 'true_false',
}

export interface AnswerOption {
    id: string;
    persistedId: number | null;
    text: string;
    isCorrect: boolean;
}

export interface TestQuestion {
    id: string;
    persistedId: number | null;
    type: QuestionType;
    text: string;
    answers: AnswerOption[];
    isSaved: boolean;
}

export interface QuestionTypeOption {
    value: QuestionType;
    label: string;
}

export interface TestPayload {
    title: string;
    description: string | null;
    attempts: number;
    questions: TestQuestion[];
}

export interface TestAnswerRequest {
    id: number | null;
    text: string;
    is_correct: boolean;
}

export interface TestQuestionRequest {
    id: number | null;
    type: QuestionType;
    text: string;
    answers: TestAnswerRequest[];
}

export interface TestCreateRequest {
    title: string;
    description: string | null;
    attempts: number;
    questions: TestQuestionRequest[];
}

export interface TestDetailAnswer {
    id: number;
    text: string;
    is_correct: boolean;
}

export interface TestDetailQuestion {
    id: number;
    type: QuestionType;
    text: string;
    answers: TestDetailAnswer[];
}

export interface TestDetail {
    id: number;
    link: string | null;
    title: string;
    description: string | null;
    attempts: number;
    is_public: boolean;
    questions: TestDetailQuestion[];
}

export interface TestFormFooterState {
    label: string;
    isSaving: boolean;
    isDisabled: boolean;
}

export interface TestToolbarProps {
    attempts: number;
    link: string | null;
}

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

export interface CreatedTest {
    id: number;
    link: string | null;
}
