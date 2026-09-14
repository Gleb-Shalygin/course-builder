<template>
    <div class="profile-sidebar__content">
        <div class="profile-sidebar__logo">
            <Logo />
        </div>

        <a-menu
            class="profile-sidebar__menu"
            mode="inline"
            theme="light"
            :selected-keys="selectedKeys"
        >
            <a-menu-item
                v-for="item in menuItems"
                :key="item.key"
                @click="handleSelect(item.key)"
            >
                <component :is="item.icon" />
                <span>{{ item.label }}</span>
            </a-menu-item>
        </a-menu>
    </div>
</template>

<script setup lang="ts">
import Logo from '@/layout/profile/Logo.vue';
import { useProfileNavigation } from '@/composables/components/useProfileNavigation';

const { menuItems, selectedKeys, handleSelect } = useProfileNavigation();
</script>
