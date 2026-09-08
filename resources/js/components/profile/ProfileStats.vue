<template>
    <div class="profile-stats">
        <a-alert
            v-if="isError"
            class="profile-stats__error"
            type="error"
            show-icon
            :message="errorMessage"
        />

        <a-row :gutter="[16, 16]">
            <a-col :xs="24" :sm="8">
                <a-card class="profile-stats__card" :bordered="false" :loading="loading">
                    <a-statistic title="Всего тестов" :value="testsCount">
                        <template #prefix>
                            <AppstoreOutlined />
                        </template>
                    </a-statistic>
                </a-card>
            </a-col>

            <a-col :xs="24" :sm="8">
                <a-card class="profile-stats__card" :bordered="false" :loading="loading">
                    <a-statistic title="Публичных" :value="publicTestsCount">
                        <template #prefix>
                            <GlobalOutlined />
                        </template>
                    </a-statistic>
                </a-card>
            </a-col>

            <a-col :xs="24" :sm="8">
                <a-card class="profile-stats__card" :bordered="false" :loading="loading">
                    <a-statistic title="Прохождений" :value="finishedCount">
                        <template #prefix>
                            <CheckCircleOutlined />
                        </template>
                    </a-statistic>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { AppstoreOutlined, CheckCircleOutlined, GlobalOutlined } from '@ant-design/icons-vue';
import { useProfileStats } from '@/composables/components/useProfileStats';

const { loading, errorMessage, isError, testsCount, publicTestsCount, finishedCount } = useProfileStats();
</script>
