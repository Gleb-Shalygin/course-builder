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
        if (!Schema::hasTable('test_question_answers')) {
            Schema::create('test_question_answers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('test_question_id')
                    ->constrained('test_questions')
                    ->cascadeOnDelete();
                $table->foreignId('test_answer_id')
                    ->constrained('test_answers')
                    ->cascadeOnDelete();
                $table->boolean('is_correct')->default(false);
                $table->unsignedInteger('position')->default(0);
                $table->timestamps();

                $table->unique(['test_question_id', 'test_answer_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_question_answers');
    }
};
