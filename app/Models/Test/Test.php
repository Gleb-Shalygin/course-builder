<?php

namespace App\Models\Test;

use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    protected $table = 'tests';

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'is_public'
    ];
}
