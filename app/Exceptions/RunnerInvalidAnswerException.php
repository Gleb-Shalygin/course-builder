<?php

namespace App\Exceptions;

class RunnerInvalidAnswerException extends ApiException
{
    protected int $status = 422;
    protected string $errorCode = 'RUNNER_INVALID_ANSWER';
}
