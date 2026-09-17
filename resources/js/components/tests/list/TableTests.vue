<template>
    <a-spin
        class="profile-tests__loader"
        :spinning="isLoading"
        tip="Загружаем тесты..."
    >
        <a-alert
            v-if="isError"
            class="profile-tests__error"
            type="error"
            :message="errorMessage"
            show-icon
        />

        <div v-else class="profile-tests">
            <TableTestItem
                v-for="test in tests"
                :key="test.id"
                :test="test"
            />
        </div>
    </a-spin>
</template>

<script setup lang="ts">
import TableTestItem from '@/components/tests/list/TableTestItem.vue';
import { useTableTests } from '@/composables/tests/list/useTableTests';

const { tests, isLoading, isError, errorMessage } = useTableTests();
</script>
