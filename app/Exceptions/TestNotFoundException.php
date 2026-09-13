<?php

namespace App\Exceptions;

class TestNotFoundException extends ApiException
{
    protected int $status = 404;
    protected string $errorCode = 'TEST_NOT_FOUND';
}
