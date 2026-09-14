<template>
    <a-card class="profile-summary" :bordered="false">
        <div class="profile-summary__head">
            <a-avatar :size="72" class="profile-summary__avatar">{{ userInitials }}</a-avatar>

            <div class="profile-summary__identity">
                <h2 class="profile-summary__name">{{ userName }}</h2>
                <span class="profile-summary__email">{{ userEmail }}</span>
                <a-tag color="blue">Автор тестов</a-tag>
            </div>
        </div>

        <a-descriptions
            class="profile-summary__details"
            :column="{ xs: 1, sm: 1, md: 2 }"
            size="small"
            bordered
        >
            <a-descriptions-item label="Имя">{{ userName }}</a-descriptions-item>
            <a-descriptions-item label="Email">{{ userEmail }}</a-descriptions-item>
        </a-descriptions>
    </a-card>
</template>

<script setup lang="ts">
import { useProfileUserMenu } from '@/composables/components/useProfileUserMenu';

const { userName, userEmail, userInitials } = useProfileUserMenu();
</script>
