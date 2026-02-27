<template>
    <ProfileLayout />
</template>

<script lang="ts" setup>
import { defineOptions } from 'vue';
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';

defineOptions({
    layout: ProfileLayout
});
</script>

