<template>
    <TestForm :test-id="null" />
</template>

<script setup lang="ts">
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import TestForm from '@/components/tests/builder/TestForm.vue';

defineOptions({
    layout: ProfileLayout,
});
</script>
