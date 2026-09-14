<?php

namespace App\Exceptions;

class TestNotCreatedException extends ApiException
{
    protected int $status = 422;
    protected string $errorCode = 'TEST_NOT_CREATED';
}
