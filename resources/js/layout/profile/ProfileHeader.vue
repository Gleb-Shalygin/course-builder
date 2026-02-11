<template>
    <a-layout-header class="profile-header">
        <div class="profile-header__custom">
            <div class="profile-header__burger" @click="openMenu">
                <MenuOutlined />
            </div>

            <Logo />

            <ExitButton />
        </div>

        <a-drawer
            :open="isMenuOpen"
            placement="left"
            :width="280"
            :closable="false"
            root-class-name="profile-sidebar-drawer"
            @close="closeMenu"
        >
            <ProfileSidebarContent />
        </a-drawer>
    </a-layout-header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MenuOutlined } from '@ant-design/icons-vue';
import Logo from '@/layout/profile/Logo.vue';
import ExitButton from '@/components/profile/ExitButton.vue';
import ProfileSidebarContent from '@/layout/profile/ProfileSidebarContent.vue';

const isMenuOpen = ref(false);

const openMenu = () => {
    isMenuOpen.value = true;
};

const closeMenu = () => {
    isMenuOpen.value = false;
};
</script>

