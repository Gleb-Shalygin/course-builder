<template>
    <a-layout-header class="profile-header">
        <div class="profile-header__left">
            <button
                class="profile-header__burger"
                type="button"
                @click="openMobileMenu"
            >
                <MenuOutlined />
            </button>

            <h1 class="profile-header__title">{{ pageTitle }}</h1>
        </div>

        <ProfileUserMenu />

        <a-drawer
            :open="isMobileMenuOpen"
            placement="left"
            :width="260"
            :closable="false"
            :body-style="{ padding: 0 }"
            root-class-name="profile-drawer"
            @close="closeMobileMenu"
        >
            <ProfileSidebarContent />
        </a-drawer>
    </a-layout-header>
</template>

<script setup lang="ts">
import { MenuOutlined } from '@ant-design/icons-vue';
import ProfileUserMenu from '@/layout/profile/ProfileUserMenu.vue';
import ProfileSidebarContent from '@/layout/profile/ProfileSidebarContent.vue';
import { useProfileLayout } from '@/composables/components/useProfileLayout';

const { isMobileMenuOpen, pageTitle, openMobileMenu, closeMobileMenu } = useProfileLayout();
</script>
