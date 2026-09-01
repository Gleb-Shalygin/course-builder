<template>
    <div class="test-create__questions-list">
        <question-card
            v-for="(question, index) in questions"
            :key="question.id"
            :question="question"
            :index="index"
            :individual-checking="settings.individualChecking"
        />

        <div class="test-create__add-next">
            <a-button type="dashed" @click="addQuestion"> ➕ Добавить следующий вопрос </a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const questions = inject('question-list');
const settings = inject('settings');
const addQuestion = inject('add-question');
</script>
