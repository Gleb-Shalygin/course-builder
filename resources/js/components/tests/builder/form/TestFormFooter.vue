<template>
    <div ref="footerElement" class="test-form__footer" :class="footerClass">
        <a-button
            class="test-form__submit"
            type="primary"
            size="large"
            :loading="footer.isSaving"
            :disabled="footer.isDisabled"
            @click="handleSave"
        >
            <template #icon>
                <SaveOutlined />
            </template>
            {{ footer.label }}
        </a-button>
    </div>
</template>

<script setup lang="ts">
import { SaveOutlined } from '@ant-design/icons-vue';
import { useTestFormFooter } from '@/composables/tests/builder/useTestFormFooter';
import type { TestFormFooterState } from '@/types/tests/Test.ts';

interface TestFormFooterProps {
    footer: TestFormFooterState;
}

defineProps<TestFormFooterProps>();

const emit = defineEmits<{
    (e: 'save'): void;
}>();

const { footerElement, footerClass } = useTestFormFooter();

const handleSave = (): void => {
    emit('save');
};
</script>
