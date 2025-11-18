<template>
    <a-layout>
        <a-layout-header class="profile-header">
            <logo />
        </a-layout-header>
        <a-layout-content class="profile-main">
            <a-layout style="padding: 24px 0; background: #fff">
                <div class="profile-sidebar">
                    <a-layout-sider
                        style="background: #fff"
                    >
                        <div class="profile-sidebar__user">
                            <div class="profile-sidebar__user--img">
                                <a-avatar :size="50">
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

                <a-layout-content :style="{ padding: '0 24px', height: '100vh' }">
                    <a-tabs v-model:activeKey="activeKey">
                        <a-tab-pane key="1" tab="Тесты">Страница с тестами</a-tab-pane>
                        <a-tab-pane key="2" tab="Курсы" force-render>Страница с курсами</a-tab-pane>
                    </a-tabs>
                </a-layout-content>
            </a-layout>
        </a-layout-content>
        <a-layout-footer style="text-align: center">
            Course Builder ©2025 Created by DarthVader
        </a-layout-footer>
    </a-layout>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { UserOutlined, } from '@ant-design/icons-vue';
import Logo from '@/components/profile/layout/Logo.vue';

const activeKey = ref('1');
</script>
