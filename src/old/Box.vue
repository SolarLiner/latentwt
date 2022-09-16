<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  orientation: "row" | "column";
  align: "start" | "end" | "center";
  padding?: "s" | "m" | "l";
}>();
const orientationClass = computed(() => `flex-${props.orientation}`);
const alignClass = computed(() => `flex-align-${props.align}`);
const paddingClass = computed(() =>
  props.padding ? `flex-pad-${props.padding}` : undefined
);
</script>

<template>
  <div :class="[orientationClass, paddingClass, alignClass]"><slot /></div>
</template>

<style lang="sass" scoped>
.flex
    display: flex

    &.flex-row
        flex-direction: row

    &.flex-column
        flex-direction: column

    &.flex-start
        align-content: flex-start

    &.flex-end
        align-content: flex-end

    &.flex-pad-s *
        display: block
        padding: 1em

    &.flex-pad-m *
        display: block
        padding: 2em

    &.flex-pad-l *
        display: block
        padding: 4em
</style>
