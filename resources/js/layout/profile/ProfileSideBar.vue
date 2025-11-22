<template>
    <div class="profile-sidebar">
        <a-layout-sider
            style="background: #fff"
        >
            <div class="profile-sidebar__user">
                <div class="profile-sidebar__user--img">
                    <a-avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&k" :size="50">
                        <template #icon>
                            <UserOutlined />
                        </template>
                    </a-avatar>
                </div>
                <div class="profile-sidebar__user--info">
                    <p>Шалыгин Г.А.</p>
                    <button>Изменить</button>
                </div>
            </div>
        </a-layout-sider>
    </div>
</template>

<script setup>
import { UserOutlined } from '@ant-design/icons-vue';

</script>
