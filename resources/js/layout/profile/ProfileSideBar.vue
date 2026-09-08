<template>
    <a-layout-sider
        class="profile-sidebar"
        theme="light"
        :width="260"
    >
        <ProfileSidebarContent />
    </a-layout-sider>
</template>

<script setup lang="ts">
import ProfileSidebarContent from '@/layout/profile/ProfileSidebarContent.vue';
</script>
