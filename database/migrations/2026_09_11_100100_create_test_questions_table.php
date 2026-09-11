<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('test_questions')) {
            Schema::create('test_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('test_id')
                    ->constrained('tests')
                    ->cascadeOnDelete();
                $table->string('type', 50);
                $table->text('text');
                $table->unsignedInteger('position')->default(0);
                $table->timestamps();

                $table->index(['test_id', 'position']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_questions');
    }
};
