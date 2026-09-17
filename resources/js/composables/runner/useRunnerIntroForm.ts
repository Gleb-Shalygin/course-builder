import { computed, ref } from 'vue';
import type { RunnerParticipantForm } from '@/types/runner/TestRunner.ts';

export function useRunnerIntroForm() {
    const firstName = ref('');
    const lastName = ref('');
    const validationMessage = ref('');

    const isFirstNameFilled = computed((): boolean => firstName.value.trim() !== '');
    const isLastNameFilled = computed((): boolean => lastName.value.trim() !== '');
    const isFilled = computed((): boolean => isFirstNameFilled.value && isLastNameFilled.value);
    const isValidationVisible = computed((): boolean => validationMessage.value !== '');
    const participant = computed((): RunnerParticipantForm => ({
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
    }));

    const validate = (): boolean => {
        if (!isFilled.value) {
            validationMessage.value = 'Укажите имя и фамилию — так мы поймём, чей это результат';

            return false;
        }

        validationMessage.value = '';

        return true;
    };

    return {
        firstName,
        lastName,
        validationMessage,
        isFilled,
        isValidationVisible,
        participant,
        validate,
    };
}
