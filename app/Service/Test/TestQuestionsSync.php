<?php

namespace App\Service\Test;

use App\Data\Test\TestQuestionData;
use App\Models\Test\Test;
use App\Models\Test\TestAnswer;
use App\Models\Test\TestQuestion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TestQuestionsSync
{
    /**
     * Приводит состав вопросов и ответов теста к переданному.
     *
     * Идентификаторы уже существующих записей сохраняются: на них ссылаются
     * завершённые попытки прохождения, которые хранят выбор как `{question_id: answer_id}`.
     *
     * @param array<int, TestQuestionData> $questions
     */
    public static function sync(Test $test, array $questions): void
    {
        $questionIds = self::saveQuestions($test, $questions);
        $answerIds = self::saveAnswers($test, $questions);

        self::rebuildLinks($questions, $questionIds, $answerIds);
        self::removeDetached($test, $questionIds, $answerIds);
    }

    /**
     * @param array<int, TestQuestionData> $questions
     * @return array<int, int> идентификатор вопроса по его позиции
     */
    private static function saveQuestions(Test $test, array $questions): array
    {
        $existing = self::existingIds(TestQuestion::query()->where('test_id', $test->id));
        $now = Carbon::now()->toDateTimeString();

        $ids = [];
        $updated = [];
        $inserted = [];
        $insertedPositions = [];

        foreach ($questions as $position => $data) {
            $row = [
                'test_id' => $test->id,
                'type' => $data->type->value,
                'text' => $data->text,
                'position' => (int) $position,
            ];

            if ($data->id !== null && isset($existing[$data->id])) {
                $ids[$position] = $data->id;
                $updated[] = ['id' => $data->id] + $row;

                continue;
            }

            $insertedPositions[] = $position;
            $inserted[] = $row + ['created_at' => $now, 'updated_at' => $now];
        }

        if ($updated !== []) {
            TestQuestion::query()->upsert($updated, ['id'], ['type', 'text', 'position']);
        }

        foreach (self::insertReturningIds('test_questions', $inserted) as $index => $id) {
            $ids[$insertedPositions[$index]] = $id;
        }

        ksort($ids);

        return $ids;
    }

    /**
     * @param array<int, TestQuestionData> $questions
     * @return array<int, array<int, int>> идентификатор ответа по позиции вопроса и позиции ответа
     */
    private static function saveAnswers(Test $test, array $questions): array
    {
        $existing = self::existingIds(TestAnswer::query()->where('test_id', $test->id));
        $now = Carbon::now()->toDateTimeString();

        $ids = [];
        $updated = [];
        $inserted = [];
        $insertedKeys = [];

        foreach ($questions as $questionPosition => $questionData) {
            foreach ($questionData->answers as $answerPosition => $answerData) {
                $row = [
                    'test_id' => $test->id,
                    'text' => $answerData->text,
                ];

                if ($answerData->id !== null && isset($existing[$answerData->id])) {
                    $ids[$questionPosition][$answerPosition] = $answerData->id;
                    $updated[] = ['id' => $answerData->id] + $row;

                    continue;
                }

                $insertedKeys[] = [$questionPosition, $answerPosition];
                $inserted[] = $row + ['created_at' => $now, 'updated_at' => $now];
            }
        }

        if ($updated !== []) {
            TestAnswer::query()->upsert($updated, ['id'], ['text']);
        }

        foreach (self::insertReturningIds('test_answers', $inserted) as $index => $id) {
            [$questionPosition, $answerPosition] = $insertedKeys[$index];
            $ids[$questionPosition][$answerPosition] = $id;
        }

        return $ids;
    }

    /**
     * Связи вопрос–ответ ни на что не ссылаются снаружи, поэтому их дешевле
     * пересобрать целиком, чем вычислять разницу.
     *
     * @param array<int, TestQuestionData> $questions
     * @param array<int, int> $questionIds
     * @param array<int, array<int, int>> $answerIds
     */
    private static function rebuildLinks(array $questions, array $questionIds, array $answerIds): void
    {
        $now = Carbon::now()->toDateTimeString();
        $rows = [];

        foreach ($questions as $questionPosition => $questionData) {
            foreach ($questionData->answers as $answerPosition => $answerData) {
                $rows[] = [
                    'test_question_id' => $questionIds[$questionPosition],
                    'test_answer_id' => $answerIds[$questionPosition][$answerPosition],
                    'is_correct' => $answerData->isCorrect,
                    'position' => (int) $answerPosition,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('test_question_answers')
            ->whereIn('test_question_id', $questionIds)
            ->delete();

        DB::table('test_question_answers')->insert($rows);
    }

    /**
     * @param array<int, int> $questionIds
     * @param array<int, array<int, int>> $answerIds
     */
    private static function removeDetached(Test $test, array $questionIds, array $answerIds): void
    {
        $keptAnswerIds = array_merge(...array_values($answerIds));

        TestQuestion::query()
            ->where('test_id', $test->id)
            ->whereNotIn('id', $questionIds)
            ->delete();

        TestAnswer::query()
            ->where('test_id', $test->id)
            ->whereNotIn('id', $keptAnswerIds)
            ->delete();
    }

    /**
     * @return array<int, int>
     */
    private static function existingIds(Builder $query): array
    {
        return array_flip($query->pluck('id')->all());
    }

    /**
     * Вставляет пачку строк одним запросом и отдаёт идентификаторы созданных записей.
     * Postgres возвращает строки `RETURNING` в порядке `VALUES`, поэтому порядок
     * результата совпадает с порядком `$rows`.
     *
     * @param array<int, array<string, mixed>> $rows
     * @return array<int, int>
     */
    private static function insertReturningIds(string $table, array $rows): array
    {
        if ($rows === []) {
            return [];
        }

        $columns = array_keys($rows[0]);
        $rowPlaceholder = '(' . implode(', ', array_fill(0, count($columns), '?')) . ')';
        $placeholders = implode(', ', array_fill(0, count($rows), $rowPlaceholder));
        $columnList = implode(', ', array_map(static fn (string $column): string => "\"$column\"", $columns));

        $bindings = [];

        foreach ($rows as $row) {
            foreach ($columns as $column) {
                $bindings[] = $row[$column];
            }
        }

        $created = DB::select(
            "INSERT INTO \"$table\" ($columnList) VALUES $placeholders RETURNING id",
            $bindings
        );

        return array_map(static fn (object $record): int => (int) $record->id, $created);
    }
}
