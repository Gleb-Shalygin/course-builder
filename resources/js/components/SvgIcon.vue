<template>
    <span
        v-if="isIconFound"
        class="svg-icon"
        v-html="svgContent"
    ></span>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { useSvgIcon } from '@/composables/ui/useSvgIcon.ts';

const props = defineProps<{
    name: string;
}>();
const { name } = toRefs(props);

const { svgContent, isIconFound } = useSvgIcon(name);
</script>
