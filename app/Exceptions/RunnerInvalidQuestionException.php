<?php

namespace App\Exceptions;

class RunnerInvalidQuestionException extends ApiException
{
    protected int $status = 422;
    protected string $errorCode = 'RUNNER_INVALID_QUESTION';
}
