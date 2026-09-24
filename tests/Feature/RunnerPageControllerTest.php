<?php

namespace Tests\Feature;

use App\Models\Test\Test;
use App\Models\Test\TestQuestion;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class RunnerPageControllerTest extends TestCase
{
    private const COMPONENT = 'tests/TestRunnerPage';

    public function test_show_renders_intro_for_guest(): void
    {
        $test = $this->createTest(questionsCount: 3);
        $this->app['auth']->forgetGuards();

        $this->get(route('tests.run', $test->link))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component(self::COMPONENT)
                ->where('intro', $this->expectedIntro($test, 3))
                ->where('auth.user', null)
            );
    }

    public function test_show_renders_intro_for_authenticated_user(): void
    {
        $test = $this->createTest(questionsCount: 2);
        $user = Auth::user();

        $this->get(route('tests.run', $test->link))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component(self::COMPONENT)
                ->where('intro', $this->expectedIntro($test, 2))
                ->where('auth.user.id', $user->id)
            );
    }

    public function test_show_counts_questions_only_of_requested_test(): void
    {
        $test = $this->createTest(questionsCount: 0);
        $this->createTest(questionsCount: 4);

        $this->get(route('tests.run', $test->link))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component(self::COMPONENT)
                ->where('intro.questionsCount', 0)
            );
    }

    public function test_show_returns_not_found_for_unknown_link(): void
    {
        $this->createTest(questionsCount: 1);

        $this->get(route('tests.run', (string) Str::uuid()))
            ->assertNotFound();
    }

    public function test_show_returns_not_found_for_non_uuid_link(): void
    {
        $this->get('/tests/not-a-uuid')
            ->assertNotFound();
    }

    private function createTest(int $questionsCount): Test
    {
        $test = Test::factory()->create([
            'user_id' => User::factory(),
            'attempts' => 1,
        ]);

        if ($questionsCount > 0) {
            TestQuestion::factory()
                ->for($test)
                ->withAnswers()
                ->count($questionsCount)
                ->sequence(static fn ($sequence): array => ['position' => $sequence->index])
                ->create();
        }

        return $test;
    }

    /**
     * @return array{link: string, title: string, description: ?string, questionsCount: int}
     */
    private function expectedIntro(Test $test, int $questionsCount): array
    {
        return [
            'link' => $test->link,
            'title' => $test->title,
            'description' => $test->description,
            'questionsCount' => $questionsCount,
        ];
    }
}
