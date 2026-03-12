<?php

namespace App\Models\Test;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestAttempt extends Model
{
    use HasFactory;

    protected $table = 'test_attempts';

    protected $fillable = [
        'test_id',
        'user_id',
        'score',
        'started_at',
        'finished_at',
    ];

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }
}
