<?php

namespace App\Models\Test;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TestAnswer extends Model
{
    use HasFactory;

    protected $table = 'test_answers';

    protected $fillable = [
        'test_id',
        'text',
    ];

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(
            TestQuestion::class,
            'test_question_answers',
            'test_answer_id',
            'test_question_id'
        )
            ->withPivot(['is_correct', 'position'])
            ->withTimestamps();
    }
}
