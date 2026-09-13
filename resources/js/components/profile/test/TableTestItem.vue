<template>
    <a-card class="profile-tests__item" :bordered="false" hoverable>
        <template #title>
            <span class="profile-tests__item-title">{{ title }}</span>
        </template>
        <template #extra>
            <a-button class="profile-tests__item-edit" @click="handleEdit">
                <template #icon>
                    <EditOutlined />
                </template>
                Изменить
            </a-button>
        </template>

        <p class="profile-tests__item-desc">{{ description }}</p>

        <div class="profile-tests__item-meta">
            <a-statistic title="Попыток" :value="attempts">
                <template #prefix>
                    <RedoOutlined />
                </template>
            </a-statistic>
            <a-statistic title="Прошли тест" :value="countFinished">
                <template #prefix>
                    <TeamOutlined />
                </template>
            </a-statistic>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { EditOutlined, RedoOutlined, TeamOutlined } from '@ant-design/icons-vue';
import { useTestItem } from '@/composables/tests/useTestItem';
import type { TestTableItem } from '@/types/TestTableItem';

const props = defineProps<{
    test: TestTableItem;
}>();
const { test } = toRefs(props);

const {
    title,
    description,
    attempts,
    countFinished,
    handleEdit,
} = useTestItem(test);
</script>
