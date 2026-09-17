<template>
    <a-card class="profile-tests__item" :bordered="false" hoverable>
        <template #title>
            <span class="profile-tests__item-title">{{ title }}</span>
        </template>
        <template #extra>
            <a-flex class="profile-tests__item-actions" :gap="8">
                <a-button
                    class="profile-tests__item-share"
                    :disabled="isShareDisabled"
                    @click="handleShare"
                >
                    <ShareAltOutlined v-if="isTouch" />
                    <LinkOutlined v-else />
                </a-button>

                <a-button class="profile-tests__item-edit" @click="handleEdit">
                    <template #icon>
                        <EditOutlined />
                    </template>
                    Изменить
                </a-button>
            </a-flex>
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

        <a-flex class="profile-tests__item-actions-mobile" :gap="8">
            <a-button class="profile-tests__item-edit-mobile" block @click="handleEdit">
                <template #icon>
                    <EditOutlined />
                </template>
                Изменить
            </a-button>

            <a-button
                class="profile-tests__item-share-mobile"
                :disabled="isShareDisabled"
                @click="handleShare"
            >
                <ShareAltOutlined v-if="isTouch" />
                <LinkOutlined v-else />
            </a-button>
        </a-flex>
    </a-card>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { EditOutlined, LinkOutlined, RedoOutlined, ShareAltOutlined, TeamOutlined } from '@ant-design/icons-vue';
import { useTestItem } from '@/composables/tests/list/useTestItem';
import type { TestTableItem } from '@/types/tests/TestTableItem';

const props = defineProps<{
    test: TestTableItem;
}>();
const { test } = toRefs(props);

const {
    title,
    description,
    attempts,
    countFinished,
    isShareDisabled,
    isTouch,
    handleEdit,
    handleShare,
} = useTestItem(test);
</script>
