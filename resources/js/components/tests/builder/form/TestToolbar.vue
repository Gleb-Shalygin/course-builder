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

            <template v-if="isLinkAvailable">
                <a-button
                    class="test-toolbar__copy"
                    :class="copyClass"
                    size="large"
                    @click="handleShare"
                >
                    <template #icon>
                        <CheckOutlined v-if="isCopied" />
                        <ShareAltOutlined v-else-if="isTouch" />
                        <LinkOutlined v-else />
                    </template>
                    {{ label }}
                </a-button>

                <a-typography-text class="test-toolbar__hint" type="secondary">
                    {{ copyHint }}
                </a-typography-text>
            </template>
        </a-flex>
    </a-card>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { CheckOutlined, LinkOutlined, ShareAltOutlined } from '@ant-design/icons-vue';
import { useTestToolbar } from '@/composables/tests/builder/useTestToolbar';
import type { TestToolbarProps } from '@/types/tests/Test.ts';

const props = defineProps<TestToolbarProps>();
const { link } = toRefs(props);

const emit = defineEmits<{
    (e: 'update:attempts', attempts: number): void;
}>();

const {
    isCopied,
    isTouch,
    isLinkAvailable,
    label,
    copyHint,
    copyClass,
    handleAttempts,
    handleShare,
} = useTestToolbar(link, emit);
</script>
