<template>
    <router-link class="app-logo" :to="{ name: routeName }">
        <svg-icon name="logo" />
    </router-link>
</template>

<script setup lang="ts">
interface LogoProps {
    routeName?: string;
}

withDefaults(defineProps<LogoProps>(), {
    routeName: 'profile',
});
</script>
