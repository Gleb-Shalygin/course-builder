<template>
    <a-dropdown :trigger="['click']" placement="bottomRight">
        <div class="profile-user-menu">
            <a-avatar :size="36" class="profile-user-menu__avatar">{{ userInitials }}</a-avatar>

            <div class="profile-user-menu__info">
                <span class="profile-user-menu__name">{{ userName }}</span>
                <span class="profile-user-menu__email">{{ userEmail }}</span>
            </div>

            <DownOutlined class="profile-user-menu__caret" />
        </div>

        <template #overlay>
            <a-menu class="profile-user-menu__overlay">
                <a-menu-item key="profile" @click="goToProfile">
                    <UserOutlined />
                    <span>Мой профиль</span>
                </a-menu-item>

                <a-menu-divider />

                <a-menu-item key="logout" danger @click="handleLogout">
                    <LogoutOutlined />
                    <span>Выйти</span>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script setup lang="ts">
import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue';
import { useProfileUserMenu } from '@/composables/components/useProfileUserMenu';

const { userName, userEmail, userInitials, goToProfile, handleLogout } = useProfileUserMenu();
</script>
