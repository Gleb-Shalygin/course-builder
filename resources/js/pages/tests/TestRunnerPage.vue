<template>
    <div class="runner-page">
        <header class="runner-page__header">
            <div class="runner-page__header-inner">
                <Logo href="/" />
            </div>
        </header>

        <div class="runner-page__container">
            <TestRunner :key="intro.link" :intro="intro" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Logo from '@/components/ui/Logo.vue';
import TestRunner from '@/components/runner/TestRunner.vue';
import type { RunnerIntro } from '@/types/runner/TestRunner.ts';

defineProps<{
    intro: RunnerIntro;
}>();
</script>
