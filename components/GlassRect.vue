<script lang="ts">
let counter = 0
</script>

<script setup lang="ts">
/**
 * A "liquid glass" box for use inside an <svg>: tinted frosted body, glossy specular cap,
 * bright rim, soft coloured shadow and a faint caustic at the bottom edge.
 * Opaque enough that lines drawn behind it don't show through.
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  x: number; y: number; w: number; h: number
  rx?: number; tint?: string; strong?: boolean
}>(), { rx: 8, tint: '#6366f1', strong: false })

const id = `gr${counter++}`
const rgb = computed(() => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(props.tint)
  return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : '99, 102, 241'
})
const c = (a: number) => `rgba(${rgb.value}, ${a})`
</script>

<template>
  <g class="glass-rect">
    <defs>
      <linearGradient :id="`${id}-body`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="c(0.10)" />
        <stop offset="55%" :stop-color="c(0.16)" />
        <stop offset="100%" :stop-color="c(0.30)" />
      </linearGradient>
      <linearGradient :id="`${id}-spec`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
      <radialGradient :id="`${id}-glint`" cx="0.18" cy="0" r="0.7">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#fff" stop-opacity="0" />
      </radialGradient>
      <filter :id="`${id}-sh`" x="-30%" y="-30%" width="160%" height="190%">
        <feDropShadow dx="0" dy="3" stdDeviation="3.5" :flood-color="`rgb(${rgb})`" :flood-opacity="strong ? 0.4 : 0.26" />
      </filter>
    </defs>
    <!-- paper underlay (keeps things behind hidden) + tinted body -->
    <rect :x="x" :y="y" :width="w" :height="h" :rx="rx" fill="#f8f7f4" :filter="`url(#${id}-sh)`" />
    <rect :x="x" :y="y" :width="w" :height="h" :rx="rx" :fill="`url(#${id}-body)`" />
    <!-- glossy cap + glint -->
    <rect :x="x + 1.5" :y="y + 1.5" :width="w - 3" :height="h * 0.48" :rx="Math.max(0, rx - 1.5)" :fill="`url(#${id}-spec)`" opacity="0.75" />
    <rect :x="x" :y="y" :width="w" :height="h" :rx="rx" :fill="`url(#${id}-glint)`" />
    <!-- rims: tinted outer, white inner highlight -->
    <rect :x="x + 0.5" :y="y + 0.5" :width="w - 1" :height="h - 1" :rx="rx" fill="none" :stroke="c(strong ? 0.95 : 0.7)" :stroke-width="strong ? 1.6 : 1.1" />
    <rect :x="x + 1.6" :y="y + 1.6" :width="w - 3.2" :height="h - 3.2" :rx="Math.max(0, rx - 1.2)" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="0.8" />
  </g>
</template>
