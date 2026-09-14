<template>
    <div class="runner-page">
        <header class="runner-page__header">
            <div class="runner-page__header-inner">
                <Logo route-name="home" />
            </div>
        </header>

        <div class="runner-page__container">
            <TestRunner :key="testKey" :test-id="testId" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Logo from '@/layout/profile/Logo.vue';
import TestRunner from '@/components/runner/TestRunner.vue';
import { useTestRouteId } from '@/composables/tests/useTestRouteId.ts';

const { testId, testKey } = useTestRouteId();
</script>
