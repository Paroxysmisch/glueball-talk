<script setup lang="ts">
/**
 * Slide 6 — the poster's optimise → verify → benchmark loop.
 * One click plays the whole build-up automatically: each box (and the arrow into it) appears in turn,
 * then the "repeat" loop draws, and the "retry with feedback" loop draws last.
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })

const W = 112, G = 22, Y = 110, H = 56
const STEP = 0.75 // seconds between boxes
const boxes = [
  { t: 'AST translation', tint: '#8b5cf6' },
  { t: 'Gluon kernel(s)', tint: '#f59e0b' },
  { t: 'Profile', tint: '#6366f1' },
  { t: 'Propose', tint: '#6366f1' },
  { t: 'Implement', tint: '#6366f1' },
  { t: 'Verify', tint: '#10b981', strong: true },
  { t: 'Benchmark', tint: '#64748b' },
].map((b, i) => ({ ...b, x: i * (W + G), at: i * STEP }))

const REPEAT_AT = boxes.length * STEP + 0.2
const RETRY_AT = REPEAT_AT + 1.4
const DRAW = 1.0

const cx = (i: number) => boxes[i].x + W / 2
const on = computed(() => props.step >= 1)
const delay = (s: number) => ({ transitionDelay: on.value ? `${s}s` : '0s' })
/** arrowhead with its tip at (x, y); drawn separately so it only appears once its path has finished drawing */
const head = (x: number, y: number, dir: 'up' | 'down') => {
  const d = dir === 'down' ? -1 : 1
  return `M ${x} ${y} L ${x - 5} ${y + 9 * d} L ${x + 5} ${y + 9 * d} Z`
}
</script>

<template>
  <div class="gl-loop">
    <svg viewBox="-4 0 920 260" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="gl-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--slidev-theme-ink-secondary)" /></marker>
      </defs>

      <!-- forward arrows: each appears just before the box it points into -->
      <line
        v-for="i in boxes.length - 1" :key="'e' + i"
        :x1="boxes[i - 1].x + W + 3" :x2="boxes[i].x - 4" :y1="Y + H / 2" :y2="Y + H / 2"
        class="edge fade" :class="{ on }" :style="delay(boxes[i].at - 0.2)" marker-end="url(#gl-a)"
      />

      <!-- repeat loop: benchmark → back to the Gluon kernels (above) -->
      <path :d="`M ${cx(6)} ${Y - 6} V ${Y - 46} H ${cx(1)} V ${Y - 8}`" class="repeat draw" :class="{ on }" :style="delay(REPEAT_AT)" pathLength="1" />
      <path :d="head(cx(1), Y - 8, 'down')" class="head-y head" :class="{ on }" :style="delay(REPEAT_AT + DRAW)" />
      <text :x="(cx(1) + cx(6)) / 2" :y="Y - 54" class="tag tag-y fade" :class="{ on }" :style="delay(REPEAT_AT + 0.4)">repeat until max. rounds</text>

      <!-- retry loop: verify → implement (below), last -->
      <path :d="`M ${cx(5)} ${Y + H + 6} V ${Y + H + 46} H ${cx(4)} V ${Y + H + 8}`" class="retry draw" :class="{ on }" :style="delay(RETRY_AT)" pathLength="1" />
      <path :d="head(cx(4), Y + H + 8, 'up')" class="head-r head" :class="{ on }" :style="delay(RETRY_AT + DRAW)" />
      <text :x="(cx(4) + cx(5)) / 2" :y="Y + H + 68" class="tag tag-r fade" :class="{ on }" :style="delay(RETRY_AT + 0.4)">reject: retry with feedback</text>

      <!-- boxes -->
      <g v-for="b in boxes" :key="b.t" class="fade" :class="{ on }" :style="delay(b.at)">
        <GlassRect :x="b.x" :y="Y" :w="W" :h="H" :rx="10" :tint="b.tint" :strong="b.strong" />
        <text :x="b.x + W / 2" :y="Y + H / 2 + 5" class="bt">{{ b.t }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.gl-loop svg { width: 100%; height: auto; overflow: visible; }
.bt { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 13.5px; text-anchor: middle; fill: var(--slidev-theme-ink); }
.edge { stroke: var(--slidev-theme-ink-secondary); stroke-width: 1.4; }
.repeat { fill: none; stroke: #f59e0b; stroke-width: 1.8; }
.retry { fill: none; stroke: #e11d48; stroke-width: 2; }
.tag { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 17px; text-anchor: middle; }
.tag-y { fill: #b45309; }
.tag-r { fill: #e11d48; }

.fade { opacity: 0; transform: translateY(8px); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.fade.on { opacity: 1; transform: none; }

.draw { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1); }
.draw.on { stroke-dashoffset: 0; }

.head { opacity: 0; transition: opacity 0.25s ease; }
.head.on { opacity: 1; }
.head-y { fill: #f59e0b; }
.head-r { fill: #e11d48; }
</style>
