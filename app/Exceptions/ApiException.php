<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

abstract class ApiException extends Exception
{
    protected int $status = 400;
    protected string $errorCode = 'API_ERROR';
    protected array $data = [];

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $this->errorCode,
            'message' => $this->getMessage(),
            'data' => $this->data,
        ], $this->status);
    }
}
