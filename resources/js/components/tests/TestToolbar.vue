<template>
    <a-card class="test-toolbar" :bordered="false">
        <a-flex class="test-toolbar__inner" align="flex-end" wrap="wrap" :gap="12">
            <a-flex class="test-toolbar__field" vertical :gap="6">
                <span class="test-toolbar__label">Количество попыток</span>

                <a-input-number
                    class="test-toolbar__attempts"
                    :value="attempts"
                    :min="1"
                    :max="99"
                    size="large"
                    @change="handleAttempts"
                />
            </a-flex>

            <a-button
                class="test-toolbar__copy"
                :class="copyClass"
                size="large"
                :disabled="isCopyDisabled"
                @click="copyLink"
            >
                <template #icon>
                    <CheckOutlined v-if="isCopied" />
                    <LinkOutlined v-else />
                </template>
                {{ copyLabel }}
            </a-button>

            <a-typography-text class="test-toolbar__hint" type="secondary">
                {{ copyHint }}
            </a-typography-text>
        </a-flex>

        <a-alert
            v-if="isError"
            class="test-toolbar__error"
            type="error"
            :message="errorMessage"
            show-icon
        />
    </a-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { CheckOutlined, LinkOutlined } from '@ant-design/icons-vue';
import { useTestLink } from '@/composables/tests/useTestLink';

interface TestToolbarProps {
    attempts: number;
    testId: number | null;
}

const props = defineProps<TestToolbarProps>();
const { testId } = toRefs(props);

const emit = defineEmits<{
    (e: 'update:attempts', attempts: number): void;
}>();

const { isCopied, isCopyDisabled, isError, errorMessage, copyLabel, copyHint, copyLink } = useTestLink(testId);

const copyClass = computed((): string => (isCopied.value ? 'test-toolbar__copy--copied' : ''));

const handleAttempts = (value: string | number): void => {
    const attempts = Number(value);

    if (!Number.isFinite(attempts)) return;

    emit('update:attempts', attempts);
};
</script>
