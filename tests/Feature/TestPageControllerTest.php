<?php

namespace Tests\Feature;

use App\Models\Test\Test;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class TestPageControllerTest extends TestCase
{
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = Auth::user();
    }

    public function test_create_renders_page(): void
    {
        $this->get(route('profile.test-create'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('tests/TestCreatePage')
                ->where('title', 'Создание теста')
                ->where('auth.user.id', $this->user->id)
            );
    }

    public function test_edit_renders_page_for_own_test(): void
    {
        $test = $this->createTest($this->user);

        $this->get(route('profile.test-edit', $test->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('tests/TestEditPage')
                ->where('title', 'Редактирование теста')
                ->where('testId', $test->id)
                ->where('auth.user.id', $this->user->id)
            );
    }

    public function test_edit_returns_not_found_for_foreign_test(): void
    {
        $test = $this->createTest(User::factory()->create());

        $this->get(route('profile.test-edit', $test->id))
            ->assertNotFound();
    }

    public function test_edit_returns_not_found_for_unknown_test(): void
    {
        $unknownId = (int) Test::query()->max('id') + 1000;

        $this->get(route('profile.test-edit', $unknownId))
            ->assertNotFound();
    }

    public function test_edit_returns_not_found_for_non_numeric_id(): void
    {
        $this->get('/profile/tests/abc/edit')
            ->assertNotFound();
    }

    public function test_create_redirects_guest_to_login(): void
    {
        $this->app['auth']->forgetGuards();

        $this->get(route('profile.test-create'))
            ->assertRedirect('/login');
    }

    public function test_edit_redirects_guest_to_login(): void
    {
        $test = $this->createTest($this->user);
        $this->app['auth']->forgetGuards();

        $this->get(route('profile.test-edit', $test->id))
            ->assertRedirect('/login');
    }

    private function createTest(User $owner): Test
    {
        return Test::factory()->create([
            'user_id' => $owner->id,
            'attempts' => 1,
        ]);
    }
}
