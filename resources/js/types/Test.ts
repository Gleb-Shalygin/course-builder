export enum QuestionType {
    Single = 'single',
    TrueFalse = 'true_false',
}

export interface AnswerOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface TestQuestion {
    id: string;
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
    attempts: number;
    questions: TestQuestion[];
}

export interface TestAnswerRequest {
    text: string;
    is_correct: boolean;
}

export interface TestQuestionRequest {
    type: QuestionType;
    text: string;
    answers: TestAnswerRequest[];
}

export interface TestCreateRequest {
    title: string;
    attempts: number;
    questions: TestQuestionRequest[];
}

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

export interface CreatedTest {
    id: number;
}
