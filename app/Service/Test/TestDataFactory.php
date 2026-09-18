<?php

namespace App\Service\Test;

use App\Data\Test\TestData;
use App\Data\Test\TestDetailAnswerData;
use App\Data\Test\TestDetailData;
use App\Data\Test\TestDetailQuestionData;
use App\Models\Test\Test;
use App\Models\Test\TestAnswer;
use App\Models\Test\TestQuestion;

class TestDataFactory
{
    public static function test(Test $test): TestData
    {
        return new TestData(
            id: $test->id,
            link: self::link($test->link),
            title: $test->title,
            description: $test->description,
            isPublic: (bool) $test->is_public,
            attempts: $test->attempts,
            countFinished: $test->count_finished,
        );
    }

    public static function detail(Test $test): TestDetailData
    {
        return new TestDetailData(
            id: $test->id,
            link: self::link($test->link),
            title: $test->title,
            description: $test->description,
            attempts: $test->attempts,
            isPublic: (bool) $test->is_public,
            questions: $test->questions
                ->map(static fn (TestQuestion $question): TestDetailQuestionData => self::question($question))
                ->all(),
        );
    }

    private static function question(TestQuestion $question): TestDetailQuestionData
    {
        return new TestDetailQuestionData(
            id: $question->id,
            type: $question->type,
            text: $question->text,
            answers: $question->answers
                ->map(static fn (TestAnswer $answer): TestDetailAnswerData => self::answer($answer))
                ->all(),
        );
    }

    private static function answer(TestAnswer $answer): TestDetailAnswerData
    {
        return new TestDetailAnswerData(
            id: $answer->id,
            text: $answer->text,
            isCorrect: (bool) $answer->pivot->is_correct,
        );
    }

    private static function link(?string $token): ?string
    {
        if ($token === null) {
            return null;
        }

        return url("/tests/{$token}");
    }
}
