<template>
    <ProfileLayout>
        <TestForm :key="testKey" :test-id="testId" />
    </ProfileLayout>
</template>

<script setup lang="ts">
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import TestForm from '@/components/tests/TestForm.vue';
import { useTestRouteId } from '@/composables/tests/useTestRouteId';

const { testId, testKey } = useTestRouteId();
</script>
