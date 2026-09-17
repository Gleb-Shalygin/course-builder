import api from '@/api/api';
import type { RunnerParticipantForm, RunnerResult, RunnerStage, RunnerState } from '@/types/runner/TestRunner';

const SESSION_HEADER = 'X-Runner-Session';

function sessionHeaders(sessionKey: string) {
    return {
        headers: {
            [SESSION_HEADER]: sessionKey,
        },
    };
}

function runnerUrl(link: string, path: string): string {
    return `/api/runner/${link}/${path}`;
}

export function getRunnerStateRequest(link: string, sessionKey: string) {
    return api.get<RunnerState>(runnerUrl(link, 'state'), sessionHeaders(sessionKey));
}

export function startRunnerRequest(link: string, sessionKey: string, participant: RunnerParticipantForm) {
    return api.post<RunnerState>(
        runnerUrl(link, 'start'),
        {
            first_name: participant.firstName.trim(),
            last_name: participant.lastName.trim(),
        },
        sessionHeaders(sessionKey),
    );
}

export function answerRunnerRequest(link: string, sessionKey: string, questionId: string, answerId: string) {
    return api.post<RunnerState>(
        runnerUrl(link, 'answer'),
        {
            question_id: Number(questionId),
            answer_id: Number(answerId),
        },
        sessionHeaders(sessionKey),
    );
}

export function positionRunnerRequest(link: string, sessionKey: string, stage: RunnerStage, questionId: string) {
    return api.patch<RunnerState>(
        runnerUrl(link, 'position'),
        {
            stage,
            question_id: Number(questionId),
        },
        sessionHeaders(sessionKey),
    );
}

export function finishRunnerRequest(link: string, sessionKey: string) {
    return api.post<RunnerResult>(runnerUrl(link, 'finish'), {}, sessionHeaders(sessionKey));
}
