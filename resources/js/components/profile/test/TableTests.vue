<template>
    <div class="profile-tests">
        <TableTestItem
            v-for="test in tests"
            :key="test.id"
            :test="test"
        />
    </div>
</template>

<script setup lang="ts">
import TableTestItem from '@/components/profile/test/TableTestItem.vue';
import { useTableTests } from '@/composables/tests/useTableTests';

const { tests } = useTableTests();
</script>
