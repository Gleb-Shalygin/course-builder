<template>
    <div class="runner-page">
        <header class="runner-page__header">
            <div class="runner-page__header-inner">
                <Logo href="/" />
            </div>
        </header>

        <div class="runner-page__container">
            <TestRunner :key="link" :test-link="link" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Logo from '@/components/ui/Logo.vue';
import TestRunner from '@/components/runner/TestRunner.vue';

defineProps<{
    link: string;
}>();
</script>
