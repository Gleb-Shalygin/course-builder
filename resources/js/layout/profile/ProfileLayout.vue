<template>
    <a-layout class="profile-shell">
        <ProfileSideBar />

        <a-layout class="profile-shell__main">
            <ProfileHeader />

            <a-layout-content class="profile-content">
                <div class="profile-content__inner">
                    <slot />
                </div>
            </a-layout-content>

            <ProfileFooter />
        </a-layout>
    </a-layout>
</template>

<script setup lang="ts">
import ProfileHeader from '@/layout/profile/ProfileHeader.vue';
import ProfileSideBar from '@/layout/profile/ProfileSideBar.vue';
import ProfileFooter from '@/layout/profile/ProfileFooter.vue';
</script>
