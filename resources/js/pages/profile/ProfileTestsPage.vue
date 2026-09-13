<template>
    <ProfileLayout>
        <div class="profile-page">
            <div class="profile-page__toolbar">
                <a-button type="primary" size="large" @click="goToTestCreate">
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
import { PlusOutlined } from '@ant-design/icons-vue';
import ProfileLayout from '@/layout/profile/ProfileLayout.vue';
import TableTests from '@/components/profile/test/TableTests.vue';
import { useTestsNavigation } from '@/composables/tests/useTestsNavigation';

defineOptions({
    layout: ProfileLayout
});

const { goToTestCreate } = useTestsNavigation();
</script>
