<template>
    <div class="profile-sidebar__content">
        <Logo />

        <ProfileUserCard />

        <div class="profile-sidebar__nav">
            <router-link
                to="/profile"
                class="profile-sidebar__nav-link"
                active-class="profile-sidebar__nav-link--active"
                exact
            >
                Профиль
            </router-link>
            <router-link
                to="/profile/tests"
                class="profile-sidebar__nav-link"
                active-class="profile-sidebar__nav-link--active"
            >
                Тесты
            </router-link>
        </div>

        <slot />
    </div>
</template>

<script setup lang="ts">
import ProfileUserCard from '@/layout/profile/ProfileUserCard.vue';
import Logo from '@/layout/profile/Logo.vue';
</script>

