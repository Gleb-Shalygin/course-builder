<?php

namespace App\Exceptions;

class RunnerAttemptNotFoundException extends ApiException
{
    protected int $status = 404;
    protected string $errorCode = 'RUNNER_ATTEMPT_NOT_FOUND';
}
