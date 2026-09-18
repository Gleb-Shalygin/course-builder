<template>
    <div class="profile-page">
        <ProfileStats />

        <ProfileSummaryCard />
    </div>
</template>

<script lang="ts" setup>
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import ProfileStats from '@/components/profile/ProfileStats.vue';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard.vue';

defineOptions({
    layout: ProfileLayout,
});
</script>
