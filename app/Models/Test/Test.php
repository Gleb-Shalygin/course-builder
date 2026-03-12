<?php

namespace App\Models\Test;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;

    protected $table = 'tests';

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'is_public'
    ];

    public function testAttempt() {
        return $this->hasMany(TestAttempt::class);
    }
}
