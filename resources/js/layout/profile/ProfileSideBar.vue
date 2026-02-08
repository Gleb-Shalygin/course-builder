<template>
    <div class="profile-sidebar">
        <a-layout-sider style="background: #fff">
            <div class="profile-sidebar__user">
                <div class="profile-sidebar__user--img">
                    <a-avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&k" :size="50">
                        <template #icon>
                            <UserOutlined />
                        </template>
                    </a-avatar>
                </div>
                <div class="profile-sidebar__user--info">
                    <p>{{ name }}</p>
                    <button>Изменить</button>
                </div>
            </div>
        </a-layout-sider>
    </div>
</template>

<script setup lang="ts">
import { UserOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/store/userStore.js';
import { computed } from 'vue';

const store = useUserStore();

const name = computed((): string => store.user.name);
</script>
