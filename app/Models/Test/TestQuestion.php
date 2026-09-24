<?php

namespace App\Models\Test;

use App\Enums\QuestionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TestQuestion extends Model
{
    use HasFactory;

    protected $table = 'test_questions';

    protected $fillable = [
        'test_id',
        'type',
        'text',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'type' => QuestionType::class,
        ];
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }

    public function answers(): BelongsToMany
    {
        return $this->belongsToMany(
            TestAnswer::class,
            'test_question_answers',
            'test_question_id',
            'test_answer_id'
        )
            ->withPivot(['is_correct', 'position'])
            ->withTimestamps()
            ->orderBy('test_question_answers.position');
    }
}
