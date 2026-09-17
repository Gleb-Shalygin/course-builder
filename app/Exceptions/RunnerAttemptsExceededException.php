<?php

namespace App\Exceptions;

class RunnerAttemptsExceededException extends ApiException
{
    protected int $status = 403;
    protected string $errorCode = 'RUNNER_ATTEMPTS_EXCEEDED';
}
