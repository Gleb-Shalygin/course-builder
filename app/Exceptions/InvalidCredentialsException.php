<?php

namespace App\Exceptions;


class InvalidCredentialsException extends ApiException
{
    protected int $status = 401;
    protected string $errorCode = 'INVALID_CREDENTIALS';

    public function __construct(string $message)
    {
        parent::__construct($message);
        $this->data = ['user_id' => $message];
    }
}

