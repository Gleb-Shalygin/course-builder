<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('test_attempts', function (Blueprint $table): void {
            $table->string('first_name')->nullable()->after('user_id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('session_key')->nullable()->after('last_name');
            $table->json('answers')->nullable()->after('score');

            $table->index(['test_id', 'session_key']);
        });
    }

    public function down(): void
    {
        Schema::table('test_attempts', function (Blueprint $table): void {
            $table->dropIndex(['test_id', 'session_key']);
            $table->dropColumn(['first_name', 'last_name', 'session_key', 'answers']);
        });
    }
};
