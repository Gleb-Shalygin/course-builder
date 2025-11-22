<template>
    <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="Тесты">Страница с тестами</a-tab-pane>
        <!--                        <a-tab-pane key="2" tab="Курсы" force-render>Страница с курсами</a-tab-pane>-->
    </a-tabs>
</template>

<script lang="ts" setup>
import { ref, defineOptions } from 'vue';
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';

defineOptions({
    layout: ProfileLayout
});

const activeKey = ref('1');
</script>

