<template>
    <ProfileLayout>
        <TestForm :test-id="null" />
    </ProfileLayout>
</template>

<script setup lang="ts">
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import TestForm from '@/components/tests/TestForm.vue';
</script>
