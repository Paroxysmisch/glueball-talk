<script setup lang="ts">
/**
 * "left → right" label for use inside an <svg>, centred on x with baseline y, with a drawn arrow
 * instead of the Unicode one. `gap` is the half-width reserved for the arrow.
 */
withDefaults(defineProps<{ x: number; y: number; left: string; right: string; gap?: number; size?: number }>(), { gap: 12, size: 11 })
</script>

<template>
  <g class="svg-arrow-label">
    <text :x="x - gap" :y="y" text-anchor="end" :style="{ fontSize: `${size}px` }">{{ left }}</text>
    <path :d="`M ${x - gap + 4} ${y - size * 0.33} H ${x + gap - 4}`" />
    <path :d="`M ${x + gap - 8} ${y - size * 0.33 - 3.2} L ${x + gap - 4} ${y - size * 0.33} L ${x + gap - 8} ${y - size * 0.33 + 3.2}`" />
    <text :x="x + gap" :y="y" text-anchor="start" :style="{ fontSize: `${size}px` }">{{ right }}</text>
  </g>
</template>

<style scoped>
text { font-family: var(--mono); fill: var(--slidev-theme-ink); }
path { fill: none; stroke: var(--slidev-theme-ink); stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; opacity: 0.75; }
</style>
