import { ref } from 'vue';

export function useTestCreatePage() {
    const questions = ref({
        settings: {
            access_type: '',
            email: 'test@mail.ru',
            send_results_to_email: true,
            teacher_reviewed: true,
            individual_checking: true,
            attempts: 99,
        },
        tests: [
            {
                id: null,
                question_text: 'Что такое Past Present Perfect?',
                type: 'single',
                answer: [
                    {
                        id: 1,
                        text: 'Да',
                        correct: true,
                    },
                    {
                        id: 2,
                        text: 'Нет',
                        correct: false,
                    },
                ],
                correct_answer: '',
            },
        ],
    });


    return {
        questions
    }
}
