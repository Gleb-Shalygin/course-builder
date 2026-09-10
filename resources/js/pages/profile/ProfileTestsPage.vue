<template>
    <ProfileLayout>
        <div class="profile-page">
            <div class="profile-page__toolbar">
                <div class="profile-page__toolbar-info">
                    <h2 class="profile-page__toolbar-title">Ваши тесты</h2>
                    <span class="profile-page__toolbar-subtitle">Управляйте тестами и смотрите статистику прохождений</span>
                </div>

                <a-button type="primary" size="large" @click="goToCreateTest">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Создать тест
                </a-button>
            </div>

            <TableTests />
        </div>
    </ProfileLayout>
</template>

<script lang="ts" setup>
import { defineOptions } from 'vue';
import { useRouter } from 'vue-router';
import { PlusOutlined } from '@ant-design/icons-vue';
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import TableTests from '@/components/profile/test/TableTests.vue';

defineOptions({
    layout: ProfileLayout
});

const router = useRouter();

const goToCreateTest = () => {
    router.push({ name: 'test-create' });
};
</script>
