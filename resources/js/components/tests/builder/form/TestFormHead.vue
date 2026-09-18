<template>
    <a-flex class="test-form__head" align="center" justify="space-between" :gap="8">
        <a-button class="test-form__back" @click="goToTests">
            <template #icon>
                <ArrowLeftOutlined />
            </template>
            К тестам
        </a-button>

        <a-tag class="test-form__counter" color="blue">{{ countLabel }}</a-tag>
    </a-flex>
</template>

<script setup lang="ts">
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { useTestsNavigation } from '@/composables/tests/useTestsNavigation';

interface TestFormHeadProps {
    countLabel: string;
}

defineProps<TestFormHeadProps>();

const { goToTests } = useTestsNavigation();
</script>
