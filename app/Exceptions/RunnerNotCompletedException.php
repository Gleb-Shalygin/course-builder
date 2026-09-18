<?php

namespace App\Exceptions;

class RunnerNotCompletedException extends ApiException
{
    protected int $status = 422;
    protected string $errorCode = 'RUNNER_NOT_COMPLETED';
}
