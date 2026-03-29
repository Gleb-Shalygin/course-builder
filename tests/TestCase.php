<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\WithFaker;

abstract class TestCase extends BaseTestCase
{
    use DatabaseTransactions, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs($this->createUser());
    }

    protected function createUser(): User
    {
        return User::factory()->create();
    }
}
