<template>
    <a-layout>
        <ProfileHeader />

        <a-layout-content class="profile-main">
            <a-layout style="padding: 24px 0; background: #fff">
                <ProfileSideBar />
                <a-layout-content :style="{ padding: '0 24px', minHeight: '100vh' }">
                    <slot />
                </a-layout-content>
            </a-layout>
        </a-layout-content>

        <ProfileFooter />
    </a-layout>

</template>

<script setup lang="ts">
import ProfileHeader from '@/layout/profile/ProfileHeader.vue';
import ProfileSideBar from '@/layout/profile/ProfileSideBar.vue';
import ProfileFooter from '@/layout/profile/ProfileFooter.vue';
</script>


