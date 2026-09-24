import { computed, ref } from 'vue';
import type { RunnerParticipantForm } from '@/types/runner/TestRunner.ts';

export function useRunnerIntroForm() {
    const firstName = ref('');
    const lastName = ref('');

    const isFirstNameFilled = computed((): boolean => firstName.value.trim() !== '');
    const isLastNameFilled = computed((): boolean => lastName.value.trim() !== '');
    const isFilled = computed((): boolean => isFirstNameFilled.value && isLastNameFilled.value);
    const isHintVisible = computed((): boolean => !isFilled.value);
    const participant = computed((): RunnerParticipantForm => ({
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
    }));

    return {
        firstName,
        lastName,
        isFilled,
        isHintVisible,
        participant,
    };
}
