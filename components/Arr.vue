<script setup lang="ts">
/** A drawn arrow for use inline in text (replaces the Unicode "→", which renders poorly in our fonts). */
withDefaults(defineProps<{ w?: number }>(), { w: 1.15 })
</script>

<template>
  <svg class="arr" :style="{ width: `${w}em` }" viewBox="0 0 24 12" aria-hidden="true">
    <path d="M1 6 H21.5" />
    <path d="M16.5 1.8 L22 6 L16.5 10.2" />
  </svg>
</template>

<style scoped>
.arr { display: inline-block; height: 0.62em; vertical-align: 0.08em; margin: 0 0.18em; overflow: visible; }
.arr path { fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
</style>
