<template>
    <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="Тесты">
            <TableTests />
        </a-tab-pane>
    </a-tabs>
</template>

<script lang="ts" setup>
import { ref, defineOptions } from 'vue';
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import TableTests from '@/components/profile/TableTests.vue';

defineOptions({
    layout: ProfileLayout
});

const activeKey = ref('1');
</script>

