<script setup lang="ts">
/**
 * Wrap a markdown list: its items fade in one after another as soon as the slide appears (no clicks).
 * Final state immediately in export / overview.
 */
import { useAutoplay } from '../utils/autoplay'

const props = withDefaults(defineProps<{ step?: number; start?: number }>(), { step: 0.3, start: 0.2 })
const { on, instant } = useAutoplay(100)
</script>

<template>
  <div class="auto-stagger" :class="{ on, instant }" :style="{ '--st': `${props.step}s`, '--s0': `${props.start}s` }">
    <slot />
  </div>
</template>

<style scoped>
.auto-stagger :deep(li) { opacity: 0; transform: translateY(8px); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.auto-stagger.on :deep(li) { opacity: 1; transform: none; }
.auto-stagger.on :deep(li:nth-child(1)) { transition-delay: calc(var(--s0) + 0 * var(--st)); }
.auto-stagger.on :deep(li:nth-child(2)) { transition-delay: calc(var(--s0) + 1 * var(--st)); }
.auto-stagger.on :deep(li:nth-child(3)) { transition-delay: calc(var(--s0) + 2 * var(--st)); }
.auto-stagger.on :deep(li:nth-child(4)) { transition-delay: calc(var(--s0) + 3 * var(--st)); }
.auto-stagger.on :deep(li:nth-child(5)) { transition-delay: calc(var(--s0) + 4 * var(--st)); }
.auto-stagger.on :deep(li:nth-child(6)) { transition-delay: calc(var(--s0) + 5 * var(--st)); }
.auto-stagger.instant :deep(li) { transition: none !important; }
</style>
