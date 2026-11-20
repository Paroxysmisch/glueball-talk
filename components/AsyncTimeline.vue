<script setup lang="ts">
/**
 * Slide 2 — an asynchronous Hopper/Blackwell-style pipeline.
 * Lanes top → bottom: producer warp · TMA copy engine · consumer warps, separated by two dividers.
 * Autoplays when the slide appears: everything sweeps in left → right in time order
 * (producer issue → dependency → copy → dependency → MMA). Dependencies run only through the gaps.
 */
import { computed } from 'vue'
import { useAutoplay } from '../utils/autoplay'

// plays as soon as the slide appears (no key press)
const { on, instant } = useAutoplay()

const X0 = 180 // first column of the time axis
const T = 134 // one pipeline period
const N = 5 // tiles shown
const BH = 36 // block height
const BW = 120 // copy / MMA block width
const XMAX = 872
const lanes = [
  { y: 16, label: 'Producer warp', sub: 'issues copies' },
  { y: 90, label: 'TMA copy engine', sub: 'background data movement' },
  { y: 164, label: 'Consumer warps', sub: 'Tensor Core MMA' },
]
const top = (i: number) => lanes[i].y
const bot = (i: number) => lanes[i].y + BH
const dividers = [(bot(0) + top(1)) / 2, (bot(1) + top(2)) / 2]

const tiles = computed(() =>
  Array.from({ length: N }, (_, k) => {
    const issue = X0 + k * T
    const copyStart = issue + 30
    const copyEnd = copyStart + BW
    return { k, buf: k % 2, issue, copyStart, copyEnd, mmaStart: copyEnd + 12, mmaEnd: copyEnd + 12 + BW }
  }),
)
/** one sweep: each piece appears when the sweep reaches its x position */
const SWEEP_S = 2.2
const at = (x: number, extra = 0) => ({ transitionDelay: on.value ? `${((x - X0) / (XMAX - X0)) * SWEEP_S + extra}s` : '0s' })
</script>

<template>
  <svg class="async-tl" :class="{ instant }" viewBox="0 0 880 236" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="atl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
      </marker>
      <marker id="atl-dep" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" class="dep-head" />
      </marker>
    </defs>

    <!-- lane labels + the two dividers between lanes -->
    <g v-for="l in lanes" :key="l.label">
      <text x="0" :y="l.y + 16" class="lane-label">{{ l.label }}</text>
      <text x="0" :y="l.y + 31" class="lane-sub">{{ l.sub }}</text>
    </g>
    <line v-for="y in dividers" :key="y" x1="0" :x2="XMAX" :y1="y" :y2="y" class="divider" />

    <!-- time axis -->
    <line :x1="X0 - 8" :x2="XMAX - 4" y1="226" y2="226" class="axis" marker-end="url(#atl-arrow)" />
    <text :x="XMAX - 4" y="219" class="axis-label" text-anchor="end">time</text>

    <!-- dependencies: box edge to box edge, through the gaps only -->
    <template v-for="t in tiles" :key="'d' + t.k">
      <path :d="`M ${t.issue + 12} ${bot(0) + 2} L ${t.copyStart + 12} ${top(1) - 3}`" class="dep piece" :class="{ on }" :style="at(t.issue, 0.15)" marker-end="url(#atl-dep)" />
      <path v-if="t.mmaEnd < XMAX" :d="`M ${t.copyEnd - 8} ${bot(1) + 2} L ${t.mmaStart + 8} ${top(2) - 3}`" class="dep piece" :class="{ on }" :style="at(t.copyEnd, 0.1)" marker-end="url(#atl-dep)" />
    </template>

    <!-- producer issues -->
    <g v-for="t in tiles" :key="'p' + t.k" class="piece" :class="{ on }" :style="at(t.issue)">
      <GlassRect :x="t.issue" :y="top(0)" :w="24" :h="BH" :rx="6" tint="#f59e0b" />
    </g>

    <!-- TMA copies -->
    <g v-for="t in tiles" :key="'c' + t.k" class="piece" :class="{ on }" :style="at(t.copyStart, 0.25)">
      <GlassRect :x="t.copyStart" :y="top(1)" :w="BW" :h="BH" :rx="8" :tint="t.buf ? '#06b6d4' : '#6366f1'" />
      <SvgArrowLabel :x="t.copyStart + BW / 2" :y="top(1) + BH / 2 + 4" :left="`copy ${t.k}`" :right="`buf ${t.buf}`" />
    </g>

    <!-- consumer MMAs -->
    <g v-for="t in tiles" :key="'m' + t.k" class="piece" :class="{ on }" :style="at(t.mmaStart, 0.25)">
      <template v-if="t.mmaEnd < XMAX">
        <GlassRect :x="t.mmaStart" :y="top(2)" :w="BW" :h="BH" :rx="8" tint="#10b981" />
        <text :x="t.mmaStart + BW / 2" :y="top(2) + BH / 2 + 4" class="blk-text">MMA tile {{ t.k }}</text>
      </template>
    </g>
  </svg>
</template>

<style scoped>
.async-tl { width: 100%; height: auto; overflow: visible; color: var(--slidev-theme-ink-secondary); }
.lane-label { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 14px; fill: var(--slidev-theme-ink); }
.lane-sub { font-family: 'Source Serif 4', Georgia, serif; font-style: italic; font-size: 12px; fill: var(--slidev-theme-ink-secondary); }
.divider { stroke: var(--slidev-theme-border); stroke-width: 1; }
.axis { stroke: var(--slidev-theme-ink-secondary); stroke-width: 1; opacity: 0.6; }
.axis-label { font-family: var(--mono); font-size: 11px; fill: var(--slidev-theme-ink-secondary); }

.blk-text { font-family: var(--mono); font-size: 11px; text-anchor: middle; fill: var(--slidev-theme-ink); }

.dep { fill: none; stroke: var(--slidev-theme-ink); stroke-width: 1.3; stroke-dasharray: 3 3; opacity: 0.6; }
.dep-head { fill: var(--slidev-theme-ink); opacity: 0.6; }

.piece { opacity: 0; transform: translateY(6px); transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.4, 0, 0.2, 1); }
.piece.on { opacity: 1; transform: none; }
.instant .piece { transition: none !important; }
</style>
