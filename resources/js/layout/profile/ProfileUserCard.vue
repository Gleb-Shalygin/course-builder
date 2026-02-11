<template>
    <div class="profile-sidebar__user">
        <div class="profile-sidebar__user--img">
            <a-avatar
                src="https://xsgames.co/randomusers/avatar.php?g=pixel&k"
                :size="50"
            >
                <template #icon>
                    <UserOutlined />
                </template>
            </a-avatar>
        </div>
        <div class="profile-sidebar__user--info">
            <p>{{ name }}</p>
            <button type="button">Изменить</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/store/userStore.js';

const store = useUserStore();

const name = computed((): string => store.user.name);
</script>

