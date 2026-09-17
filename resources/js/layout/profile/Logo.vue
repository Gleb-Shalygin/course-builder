<template>
    <Link class="app-logo" :href="href">
        <svg-icon name="logo" />
    </Link>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3';

withDefaults(
    defineProps<{
        href?: string;
    }>(),
    {
        href: '/profile',
    },
);
</script>
