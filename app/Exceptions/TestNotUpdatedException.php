<?php

namespace App\Exceptions;

class TestNotUpdatedException extends ApiException
{
    protected int $status = 422;
    protected string $errorCode = 'TEST_NOT_UPDATED';
}
