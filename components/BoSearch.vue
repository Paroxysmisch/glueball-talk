<script setup lang="ts">
/**
 * Slide 13 — Bayesian optimisation over execution schedules, with the LLM in the loop.
 * A real (tiny) Gaussian process: RBF kernel, LLM-supplied prior mean, observations from "GPU runs".
 * step 0: LLM prior (dashed) + prior uncertainty; schedules failing safety/resource checks are ruled out
 * step 1: measured runs on the GPU; posterior mean + band update
 * step 2: acquisition (the LLM, guided by upper-confidence-bound scores) picks the next schedule
 * step 3: that schedule is run; the model tightens around the best schedule
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const on = (n: number) => props.step >= n

// ---- the "world" ----
const truth = (x: number) => 0.32 + 0.52 * Math.exp(-(((x - 0.63) / 0.075) ** 2)) + 0.2 * Math.exp(-(((x - 0.24) / 0.1) ** 2))
const prior = (x: number) => 0.38 + 0.28 * Math.exp(-(((x - 0.6) / 0.2) ** 2)) // the LLM's guess: right region, too vague
const FEASIBLE_MAX = 0.86 // beyond this: exceeds shared memory / fails a safety check

// ---- a tiny GP ----
const L = 0.085, S2 = 0.022, NOISE = 1e-5
const k = (a: number, b: number) => S2 * Math.exp(-((a - b) ** 2) / (2 * L * L))
function solve(A: number[][], b: number[]) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    ;[M[c], M[p]] = [M[p], M[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let j = c; j <= n; j++) M[r][j] -= f * M[c][j]
    }
  }
  return M.map((r, i) => r[n] / r[i])
}
function posterior(X: number[], xs: number[]) {
  if (!X.length) return xs.map(x => ({ x, mu: prior(x), sd: Math.sqrt(S2) }))
  const K = X.map(a => X.map(b => k(a, b) + (a === b ? NOISE : 0)))
  const alpha = solve(K, X.map(x => truth(x) - prior(x)))
  return xs.map((x) => {
    const kx = X.map(a => k(x, a))
    const v = solve(K, kx)
    const mu = prior(x) + kx.reduce((s, ki, i) => s + ki * alpha[i], 0)
    const vr = Math.max(1e-6, S2 - kx.reduce((s, ki, i) => s + ki * v[i], 0))
    return { x, mu, sd: Math.sqrt(vr) }
  })
}

const N = 120
const grid = Array.from({ length: N + 1 }, (_, i) => i / N)
const X1 = [0.1, 0.36, 0.78]
const post1 = posterior(X1, grid)
// acquisition: upper confidence bound on the feasible region; the LLM proposes the next schedule from it
const ucb = post1.map(p => (p.x <= FEASIBLE_MAX ? p.mu + 2 * p.sd : -Infinity))
const nextIdx = ucb.indexOf(Math.max(...ucb))
const xNext = grid[nextIdx]
const X2 = [...X1, xNext]

// ---- drawing ----
const W = 560, PX = 34, PW = W - PX - 6, PT = 8, PH = 196, AT = 250, AH = 52
const sx = (x: number) => PX + x * PW
const sy = (y: number) => PT + PH - ((y - 0.15) / 0.95) * PH
const line = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ')
const band = (ps: { x: number; mu: number; sd: number }[]) =>
  `${line(ps.map(p => ({ x: p.x, y: p.mu + 2 * p.sd })))} ${ps.slice().reverse().map(p => `L${sx(p.x).toFixed(1)},${sy(p.mu - 2 * p.sd).toFixed(1)}`).join(' ')} Z`

const state = computed(() => (on(3) ? posterior(X2, grid) : on(1) ? post1 : posterior([], grid)))
const meanD = computed(() => line(state.value.map(p => ({ x: p.x, y: p.mu }))))
const bandD = computed(() => band(state.value))
const priorD = line(grid.map(x => ({ x, y: prior(x) })))
const obs = computed(() => (on(3) ? X2 : on(1) ? X1 : []))

const umax = Math.max(...ucb.filter(Number.isFinite)), umin = Math.min(...ucb.filter(Number.isFinite))
const acqD = (() => {
  const pts = grid.filter(x => x <= FEASIBLE_MAX)
  const y = (u: number) => AT + AH - ((u - umin) / (umax - umin)) * (AH - 6)
  return `M${sx(0)},${AT + AH} ` + pts.map((x, i) => `L${sx(x).toFixed(1)},${y(ucb[grid.indexOf(x)]).toFixed(1)}`).join(' ') + ` L${sx(FEASIBLE_MAX)},${AT + AH} Z`
})()
const acqTop = AT + 6
</script>

<template>
  <div class="bo">
    <svg :viewBox="`0 0 ${W} 306`" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="bo-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(100, 116, 139, 0.35)" stroke-width="2" />
        </pattern>
        <clipPath id="bo-clip"><rect :x="PX" :y="PT" :width="PW" :height="PH" /></clipPath>
        <linearGradient id="bo-acq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--slidev-theme-accent)" stop-opacity="0.55" />
          <stop offset="100%" stop-color="var(--slidev-theme-accent)" stop-opacity="0.05" />
        </linearGradient>
      </defs>

      <!-- axes -->
      <line :x1="PX" :x2="PX" :y1="PT" :y2="PT + PH" class="axis" />
      <line :x1="PX" :x2="W - 6" :y1="PT + PH" :y2="PT + PH" class="axis" />
      <text :x="12" :y="PT + PH / 2" class="ax-t" :transform="`rotate(-90 12 ${PT + PH / 2})`">throughput</text>
      <text :x="PX + PW / 2" :y="PT + PH + 16" class="ax-t">execution schedule (stages × buffering × warps)</text>

      <!-- ruled out by safety / resource checks -->
      <rect :x="sx(FEASIBLE_MAX)" :y="PT" :width="sx(1) - sx(FEASIBLE_MAX)" :height="PH" fill="url(#bo-hatch)" class="ruled" />
      <text :x="(sx(FEASIBLE_MAX) + sx(1)) / 2" :y="PT + 14" class="ruled-t">ruled</text>
      <text :x="(sx(FEASIBLE_MAX) + sx(1)) / 2" :y="PT + 26" class="ruled-t">out</text>

      <!-- model: uncertainty band + mean (animate between states) -->
      <g clip-path="url(#bo-clip)">
        <path class="band" :style="{ d: `path('${bandD}')` }" />
        <path :d="priorD" class="prior" />
        <path class="mean" :class="{ on: on(1) }" :style="{ d: `path('${meanD}')` }" />
      </g>

      <!-- the next schedule, picked from the acquisition -->
      <g class="pick" :class="{ on: on(2) }">
        <line :x1="sx(xNext)" :x2="sx(xNext)" :y1="PT + 4" :y2="PT + PH" class="pick-l" />
        <line :x1="sx(xNext)" :x2="sx(xNext)" :y1="AT + 2" :y2="AT + AH" class="pick-l" />
        <text :x="sx(xNext) + 6" :y="PT + 12" class="pick-t">next run</text>
      </g>

      <!-- measured runs on the GPU -->
      <g v-for="(x, i) in obs" :key="x">
        <circle :cx="sx(x)" :cy="sy(truth(x))" r="5" class="obs" :class="{ fresh: i === 3 }" />
      </g>

      <!-- acquisition strip -->
      <g class="acq" :class="{ on: on(2) }">
        <text :x="PX" :y="AT - 6" class="acq-h">acquisition · LLM picks the next run</text>
        <line :x1="PX" :x2="W - 6" :y1="AT + AH" :y2="AT + AH" class="axis" />
        <path :d="acqD" fill="url(#bo-acq)" class="acq-f" />
        <circle :cx="sx(xNext)" :cy="acqTop" r="4" class="acq-dot" />
      </g>
    </svg>

    <div class="legend">
      <span><i class="lg-prior" />LLM prior</span>
      <span><i class="lg-mean" />model after real runs</span>
      <span><i class="lg-obs" />run on the GPU</span>
      <span><i class="lg-ruled" />fails safety / resource checks</span>
    </div>
  </div>
</template>

<style scoped>
.bo svg { width: 100%; height: auto; overflow: visible; }
.axis { stroke: var(--slidev-theme-ink); stroke-width: 1; opacity: 0.5; }
.ax-t { font-family: 'Archivo', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; text-anchor: middle; fill: var(--slidev-theme-ink-secondary); }
.ruled { stroke: rgba(100, 116, 139, 0.35); stroke-width: 1; }
.ruled-t { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 12px; text-anchor: middle; fill: var(--slidev-theme-ink-secondary); }

.band { fill: rgba(var(--slidev-theme-primary-rgb), 0.12); transition: d 0.9s cubic-bezier(0.4, 0, 0.2, 1); }
.prior { fill: none; stroke: var(--slidev-theme-primary); stroke-width: 1.6; stroke-dasharray: 5 4; opacity: 0.7; }
.mean { fill: none; stroke: var(--slidev-theme-primary); stroke-width: 2.2; opacity: 0; transition: d 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease; }
.mean.on { opacity: 1; }
.obs { fill: var(--slidev-theme-bg); stroke: var(--slidev-theme-ink); stroke-width: 2; animation: pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
.obs.fresh { stroke: var(--slidev-theme-accent); fill: var(--slidev-theme-accent); }
@keyframes pop { from { r: 0; } }

.pick, .acq { opacity: 0; transition: opacity 0.5s ease; }
.pick.on, .acq.on { opacity: 1; }
.pick-l { stroke: var(--slidev-theme-accent); stroke-width: 1.4; stroke-dasharray: 4 3; }
.pick-t { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 14px; fill: #b45309; }
.acq-h { font-family: 'Archivo', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; fill: var(--slidev-theme-ink-secondary); }
.acq-f { stroke: var(--slidev-theme-accent); stroke-width: 1.4; }
.acq-dot { fill: var(--slidev-theme-accent); }

.legend { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 6px; font-family: 'Source Serif 4', serif; font-size: 12px; color: var(--slidev-theme-ink-secondary); }
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.legend i { display: inline-block; }
.lg-prior { width: 18px; border-top: 1.6px dashed var(--slidev-theme-primary); }
.lg-mean { width: 18px; height: 8px; background: rgba(var(--slidev-theme-primary-rgb), 0.15); border-top: 2.2px solid var(--slidev-theme-primary); }
.lg-obs { width: 9px; height: 9px; border-radius: 50%; border: 2px solid var(--slidev-theme-ink); }
.lg-ruled { width: 14px; height: 10px; background: repeating-linear-gradient(45deg, rgba(100, 116, 139, 0.35) 0 2px, transparent 2px 5px); border: 1px solid rgba(100, 116, 139, 0.35); }
</style>
