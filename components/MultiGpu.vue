<script setup lang="ts">
/**
 * Slide 12 — a Mixture-of-Experts layer on 4 GPUs, and an input-dependent distributed deadlock.
 * Each GPU: attention → all-to-all dispatch (tokens to their experts) → experts → all-to-all combine → next layer.
 * Plays by itself when the slide appears (no clicks):
 * 0: one GPU · 1: split into 4 GPUs · 2: the all-to-alls link every pair of GPUs
 * 3: GPU 2's router sends it no tokens, so its kernel early-exits and skips the all-to-all;
 *    the other three block in the collective forever. Only some inputs trigger it.
 */
import { onBeforeUnmount, ref, watch } from 'vue'
import { useAutoplay } from '../utils/autoplay'

const { on: playing, instant } = useAutoplay(200)
const step = ref(0)
const AT = [0, 0.7, 1.7, 3.0] // seconds after the slide appears at which each stage starts
let timers: ReturnType<typeof setTimeout>[] = []
const clear = () => { timers.forEach(clearTimeout); timers = [] }
watch([playing, instant], ([p, inst]) => {
  clear()
  if (inst) { step.value = 3; return }
  step.value = 0
  if (p) AT.forEach((t, k) => timers.push(setTimeout(() => (step.value = k), t * 1000)))
}, { immediate: true })
onBeforeUnmount(clear)
const on = (n: number) => step.value >= n

const devices = ['GPU 0', 'GPU 1', 'GPU 2', 'GPU 3']
const BAD = 2 // the GPU that receives no tokens
const RH = 62
const Y0 = 26
const BH = 34
const LX = 66
const G = 6
type Seg = { x: number; w: number; k: 'mm' | 'a2a'; t: string }
const segs: Seg[] = []
{
  let x = LX
  for (const [w, k, t] of [[104, 'mm', 'attention'], [86, 'a2a', 'dispatch'], [104, 'mm', 'experts'], [86, 'a2a', 'combine'], [90, 'mm', 'next layer']] as const) {
    segs.push({ x, w, k, t })
    x += w + G
  }
}
const a2aCols = segs.filter(s => s.k === 'a2a')
const rowY = (i: number) => Y0 + i * RH
const pairs: [number, number][] = []
for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) pairs.push([i, j])

const deadlocked = () => on(3)
/** label + state of segment j on GPU i */
const cell = (i: number, j: number) => {
  const s = segs[j]
  if (!deadlocked()) return { label: s.k === 'a2a' && !on(2) ? '' : s.k === 'a2a' ? 'all-to-all' : s.t, state: s.k === 'a2a' && !on(2) ? 'dim' : 'ok' }
  if (i === BAD) {
    if (s.t === 'experts') return { label: 'no tokens', state: 'faint' }
    if (s.k === 'a2a') return { label: 'skipped', state: 'skipped' }
    return { label: s.t, state: 'ok' }
  }
  if (s.t === 'dispatch') return { label: 'waiting…', state: 'waiting' }
  if (j > 1) return { label: s.t === 'combine' ? 'all-to-all' : s.t, state: 'stalled' }
  return { label: s.t, state: 'ok' }
}
const TINT = { mm: '#6366f1', a2a: '#06b6d4' }
</script>

<template>
  <svg class="mg" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
    <!-- column headers for the collectives -->
    <g class="hdrs" :class="{ on: on(2) }">
      <text v-for="c in a2aCols" :key="c.t" :x="c.x + c.w / 2" :y="Y0 - 10" class="hdr">{{ c.t }}</text>
    </g>

    <!-- all-to-all: every pair of GPUs exchanges data (drawn behind the boxes) -->
    <g class="mesh" :class="{ on: on(2) }">
      <template v-for="c in a2aCols" :key="'m' + c.t">
        <line
          v-for="[i, j] in pairs" :key="`${c.t}${i}${j}`"
          :x1="c.x + c.w / 2 - 22 + i * 4" :y1="rowY(i) + BH / 2"
          :x2="c.x + c.w / 2 + 22 - j * 4" :y2="rowY(j) + BH / 2"
          :class="{ bad: deadlocked() && (i === BAD || j === BAD) }"
        />
      </template>
    </g>

    <g
      v-for="(d, i) in devices" :key="d" class="row"
      :class="{ ghost: i > 0 && !on(1) }"
      :style="{ transform: `translateY(${on(1) ? i * RH : 0}px)`, transitionDelay: `${i * 80}ms` }"
    >
      <text x="0" :y="Y0 + BH / 2 + 5" class="dev">{{ i === 0 && !on(1) ? 'GPU' : d }}</text>
      <g v-for="(s, j) in segs" :key="j" class="cell" :class="cell(i, j).state">
        <template v-if="['dim', 'skipped'].includes(cell(i, j).state)">
          <rect :x="s.x" :y="Y0" :width="s.w" :height="BH" rx="8" class="paper" />
          <rect :x="s.x" :y="Y0" :width="s.w" :height="BH" rx="8" class="hole" />
        </template>
        <template v-else>
          <GlassRect :x="s.x" :y="Y0" :w="s.w" :h="BH" :rx="8" :tint="TINT[s.k]" />
          <!-- stalled: veil the box rather than making it transparent, so nothing behind shows through -->
          <rect :x="s.x - 1" :y="Y0 - 1" :width="s.w + 2" :height="BH + 2" rx="9" class="veil" />
        </template>
        <text :x="s.x + s.w / 2" :y="Y0 + BH / 2 + 4" class="bt">{{ cell(i, j).label }}</text>
      </g>
    </g>

    <g class="note" :class="{ on: on(3) }">
      <text x="330" :y="Y0 + 4 * RH + 8" class="note-t">GPU 2 got no tokens, so its kernel skipped the all-to-all;</text>
      <text x="330" :y="Y0 + 4 * RH + 27" class="note-t">the other three wait forever. Only some inputs trigger this.</text>
    </g>
  </svg>
</template>

<style scoped>
.mg { width: 100%; height: auto; overflow: visible; }
.row { transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease; }
.row.ghost { opacity: 0; }
.dev { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 13px; fill: var(--slidev-theme-ink); }
.bt { font-family: var(--mono); font-size: 10px; text-anchor: middle; fill: var(--slidev-theme-ink); transition: opacity 0.4s; }
.hole { fill: none; stroke: var(--slidev-theme-border); stroke-width: 1.2; stroke-dasharray: 3 3; }
.cell { transition: opacity 0.5s ease; }
.paper { fill: #f6f5f1; }
.veil { fill: #f6f5f1; opacity: 0; transition: opacity 0.5s ease; }
.cell.stalled .veil { opacity: 0.62; }
.cell.faint .bt { fill: var(--slidev-theme-ink-secondary); font-style: italic; }
.cell.skipped .hole { stroke: rgba(225, 29, 72, 0.6); }
.cell.skipped .bt { fill: #e11d48; }
.cell.waiting .bt { animation: blink 1.4s ease-in-out infinite; }
@keyframes blink { 50% { opacity: 0.35; } }

.hdrs, .mesh, .note { opacity: 0; transition: opacity 0.6s ease; }
.hdrs.on, .mesh.on, .note.on { opacity: 1; }
.hdr { font-family: 'Archivo', sans-serif; font-size: 8.5px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; text-anchor: middle; fill: var(--slidev-theme-ink-secondary); }
.mesh line { stroke: var(--slidev-theme-secondary); stroke-width: 1.2; opacity: 0.55; transition: all 0.4s ease; }
.mesh line.bad { stroke: #e11d48; stroke-dasharray: 3 3; opacity: 0.6; }
.note-t { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 16px; text-anchor: middle; fill: var(--slidev-theme-ink); }
</style>
