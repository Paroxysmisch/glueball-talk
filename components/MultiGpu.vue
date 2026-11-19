<script setup lang="ts">
/**
 * Slide 12 — one GPU timeline splits into several devices linked by collectives.
 * step 0: one GPU · 1: split into 4 devices · 2: collectives link them
 * 3: one device issues collectives in a different order → mismatch / hang
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const on = (n: number) => props.step >= n

const devices = ['GPU 0', 'GPU 1', 'GPU 2', 'GPU 3']
const RH = 64
const Y0 = 24
const LX = 82
const seg = (swap: boolean) => [
  { x: LX, w: 116, k: 'mm', t: 'compute' },
  { x: LX + 122, w: 64, k: swap ? 'ag' : 'ar', t: swap ? 'all-gather' : 'all-reduce' },
  { x: LX + 192, w: 116, k: 'mm', t: 'compute' },
  { x: LX + 314, w: 64, k: swap ? 'ar' : 'ag', t: swap ? 'all-reduce' : 'all-gather' },
  { x: LX + 384, w: 116, k: 'mm', t: 'compute' },
]
const swapped = (i: number) => i === 3 && on(3)
const links = [LX + 122 + 32, LX + 314 + 32]
const TINT: Record<string, string> = { mm: '#6366f1', ar: '#06b6d4', ag: '#f59e0b' }
</script>

<template>
  <svg class="mg" viewBox="0 0 600 290" xmlns="http://www.w3.org/2000/svg">
    <!-- collective links -->
    <g class="links" :class="{ on: on(2), bad: on(3) }">
      <line v-for="x in links" :key="x" :x1="x" :x2="x" :y1="Y0 + 18" :y2="Y0 + 3 * RH + 18" />
      <circle v-for="(d, i) in devices.length * 2" :key="'c' + i" :cx="links[i % 2]" :cy="Y0 + Math.floor(i / 2) * RH + 18" r="3" />
    </g>

    <g
      v-for="(d, i) in devices" :key="d" class="row"
      :class="{ ghost: i > 0 && !on(1) }"
      :style="{ transform: `translateY(${on(1) ? i * RH : 0}px)`, transitionDelay: `${i * 80}ms` }"
    >
      <text x="0" :y="Y0 + 22" class="dev">{{ i === 0 && !on(1) ? 'GPU' : d }}</text>
      <template v-for="(s, j) in seg(swapped(i))" :key="j">
        <rect v-if="s.k !== 'mm' && !on(2)" :x="s.x" :y="Y0" :width="s.w" height="36" rx="7" class="blk dim" />
        <GlassRect v-else :x="s.x" :y="Y0" :w="s.w" :h="36" :rx="7" :tint="TINT[s.k]" />
      </template>
      <text
        v-for="(s, j) in seg(swapped(i))" :key="'t' + j"
        :x="s.x + s.w / 2" :y="Y0 + 22" class="bt" :class="{ dim: s.k !== 'mm' && !on(2) }"
      >{{ s.k === 'mm' ? s.t : s.t.replace('all-', '') }}</text>
    </g>

    <g class="warn" :class="{ on: on(3) }">
      <text :x="LX + 250" :y="Y0 + 4 * RH + 6" class="warn-t">GPU 3 calls the collectives in a different order, so every GPU waits forever</text>
    </g>
  </svg>
</template>

<style scoped>
.mg { width: 100%; height: auto; overflow: visible; }
.row { transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease; }
.row.ghost { opacity: 0; }
.dev { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 13px; fill: var(--slidev-theme-ink); }
.blk { stroke-width: 1.2; transition: all 0.5s ease; }
.mm { fill: #e6e6f7; stroke: #6366f1; }
.ar { fill: #d2eff4; stroke: #06b6d4; }
.ag { fill: #fbeccd; stroke: #f59e0b; }
.blk.dim { fill: transparent; stroke: var(--slidev-theme-border); stroke-dasharray: 3 3; }
.bt { font-family: 'JetBrains Mono', monospace; font-size: 10px; text-anchor: middle; fill: var(--slidev-theme-ink); transition: opacity 0.4s; }
.bt.dim { opacity: 0; }
.links { opacity: 0; transition: opacity 0.6s ease; }
.links.on { opacity: 1; }
.links line { stroke: var(--slidev-theme-ink); stroke-width: 1.4; stroke-dasharray: 4 3; opacity: 0.55; }
.links circle { fill: var(--slidev-theme-ink); }
.links.bad line { stroke: #e11d48; opacity: 0.55; stroke-width: 1.6; }
.links.bad circle { fill: #e11d48; opacity: 0.7; }
.warn { opacity: 0; transition: opacity 0.5s ease 0.3s; }
.warn.on { opacity: 1; }
.warn-t { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 17px; text-anchor: middle; fill: var(--slidev-theme-ink); }
</style>
