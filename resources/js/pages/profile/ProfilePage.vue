<template>
    <ProfileLayout>
        <div class="profile-page">
            <ProfileStats />

            <ProfileSummaryCard />
        </div>
    </ProfileLayout>
</template>

<script lang="ts" setup>
import { defineOptions } from 'vue';
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import ProfileStats from '@/components/profile/ProfileStats.vue';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard.vue';

defineOptions({
    layout: ProfileLayout
});
</script>
