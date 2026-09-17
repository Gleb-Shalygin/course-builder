<?php

namespace App\Http\Controllers\Runner;

use App\Data\RunnerAnswerData;
use App\Data\RunnerPositionData;
use App\Data\RunnerSessionData;
use App\Data\RunnerStartData;
use App\Exceptions\RunnerAttemptNotFoundException;
use App\Exceptions\RunnerAttemptsExceededException;
use App\Exceptions\RunnerInvalidAnswerException;
use App\Exceptions\RunnerInvalidQuestionException;
use App\Exceptions\RunnerNotCompletedException;
use App\Exceptions\TestNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\RunnerAnswerRequest;
use App\Http\Requests\RunnerPositionRequest;
use App\Http\Requests\RunnerSessionRequest;
use App\Http\Requests\RunnerStartRequest;
use App\Http\Resources\RunnerResultResource;
use App\Http\Resources\RunnerStateResource;
use App\Service\RunnerService;

class RunnerController extends Controller
{
    /**
     * @throws TestNotFoundException
     */
    public static function state(RunnerSessionRequest $request, string $link): RunnerStateResource
    {
        $data = RunnerSessionData::from([
            'link' => $link,
            'sessionKey' => $request->validated('session_key'),
        ]);

        return RunnerStateResource::make(RunnerService::state($data));
    }

    /**
     * @throws TestNotFoundException
     * @throws RunnerAttemptsExceededException
     */
    public static function start(RunnerStartRequest $request, string $link): RunnerStateResource
    {
        $data = RunnerStartData::from([
            'link' => $link,
            'sessionKey' => $request->validated('session_key'),
            'firstName' => $request->validated('first_name'),
            'lastName' => $request->validated('last_name'),
        ]);

        return RunnerStateResource::make(RunnerService::start($data));
    }

    /**
     * @throws TestNotFoundException
     * @throws RunnerAttemptNotFoundException
     * @throws RunnerInvalidAnswerException
     */
    public static function answer(RunnerAnswerRequest $request, string $link): RunnerStateResource
    {
        $data = RunnerAnswerData::from([
            'link' => $link,
            'sessionKey' => $request->validated('session_key'),
            'questionId' => $request->validated('question_id'),
            'answerId' => $request->validated('answer_id'),
        ]);

        return RunnerStateResource::make(RunnerService::answer($data));
    }

    /**
     * @throws TestNotFoundException
     * @throws RunnerAttemptNotFoundException
     * @throws RunnerInvalidQuestionException
     */
    public static function position(RunnerPositionRequest $request, string $link): RunnerStateResource
    {
        $data = RunnerPositionData::from([
            'link' => $link,
            'sessionKey' => $request->validated('session_key'),
            'stage' => $request->validated('stage'),
            'questionId' => $request->validated('question_id'),
        ]);

        return RunnerStateResource::make(RunnerService::position($data));
    }

    /**
     * @throws TestNotFoundException
     * @throws RunnerAttemptNotFoundException
     * @throws RunnerNotCompletedException
     */
    public static function finish(RunnerSessionRequest $request, string $link): RunnerResultResource
    {
        $data = RunnerSessionData::from([
            'link' => $link,
            'sessionKey' => $request->validated('session_key'),
        ]);

        return RunnerResultResource::make(RunnerService::finish($data));
    }
}
