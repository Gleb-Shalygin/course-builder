<?php

namespace Tests\Feature;

use Tests\TestCase;

class ProfileTestListTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    public function test_list(): void
    {
        $response = $this->get('/api/tests');

        $response->assertStatus(200);
    }
}
