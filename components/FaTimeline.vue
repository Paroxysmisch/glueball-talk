<script setup lang="ts">
/**
 * Slide 3 — how long FlashAttention took to make full use of each NVIDIA data-centre generation.
 * One row per GPU: a bar from the architecture's announcement to the FlashAttention version that reaches ~70% of
 * that GPU's theoretical peak; earlier versions are marked on the row with the utilisation they achieved.
 * Dates: NVIDIA announcements (A100 14 May 2020, H100 22 Mar 2022, B200 18 Mar 2024) and arXiv/paper dates
 * (FA1 27 May 2022, FA2 17 Jul 2023, FA3 11 Jul 2024, FA4 5 Mar 2026; FA4 previewed at Hot Chips, Aug 2025).
 * Utilisation = fraction of theoretical max FLOPs/s, as reported by each paper:
 *   FA1 25–40% (A100), FA2 50–73% (A100) / 35% (H100), FA3 75% (H100, FP16), FA4 71% (B200, BF16).
 * Animates in when the slide appears.
 */
import { useAutoplay } from '../utils/autoplay'

const { on, instant } = useAutoplay(250)

const date = (y: number, m: number, d = 15) => y + (m - 1) / 12 + (d - 1) / 365
const rows = [
  {
    gpu: 'Ampere', chip: 'A100', launch: date(2020, 5, 14), launchL: 'May 2020', done: date(2023, 7, 17), tint: '#06b6d4',
    marks: [
      { at: date(2022, 5, 27), fa: 'FA1', u: '25–40%', final: false },
      { at: date(2023, 7, 17), fa: 'FA2', u: '73%', final: true },
    ],
  },
  {
    gpu: 'Hopper', chip: 'H100', launch: date(2022, 3, 22), launchL: 'Mar 2022', done: date(2024, 7, 11), tint: '#6366f1',
    marks: [
      { at: date(2023, 7, 17), fa: 'FA2', u: '35%', final: false },
      { at: date(2024, 7, 11), fa: 'FA3', u: '75%', final: true },
    ],
  },
  {
    gpu: 'Blackwell', chip: 'B200', launch: date(2024, 3, 18), launchL: 'Mar 2024', done: date(2026, 3, 5), tint: '#8b5cf6',
    marks: [
      { at: date(2025, 8, 25), fa: '', u: 'preview', final: false },
      { at: date(2026, 3, 5), fa: 'FA4', u: '71%', final: true },
    ],
  },
]
const lag = (r: { launch: number; done: number }) => `${(r.done - r.launch).toFixed(1)} yrs`

const W = 860, X0 = 2020, X1 = 2027, PX = 150, PR = 770, TOP = 34, RH = 68
const sx = (t: number) => PX + ((t - X0) / (X1 - X0)) * (PR - PX)
const ry = (i: number) => TOP + 26 + i * RH
const H = TOP + 26 + rows.length * RH + 6
</script>

<template>
  <div class="fat" :class="{ on, instant }">
    <svg :viewBox="`0 0 ${W} ${H}`" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient v-for="r in rows" :id="`fat-${r.chip}`" :key="r.chip" x1="0" x2="1">
          <stop offset="0%" :stop-color="r.tint" stop-opacity="0.08" />
          <stop offset="100%" :stop-color="r.tint" stop-opacity="0.42" />
        </linearGradient>
      </defs>

      <!-- year axis -->
      <g v-for="y in 8" :key="y">
        <line :x1="sx(X0 + y - 1)" :x2="sx(X0 + y - 1)" :y1="TOP" :y2="H - 4" class="yr-grid" />
        <text :x="sx(X0 + y - 1)" :y="TOP - 10" class="yr" text-anchor="middle">{{ X0 + y - 1 }}</text>
      </g>

      <!-- each launch, carried through every row: the next GPU arrives before the last one is fully used -->
      <g v-for="(r, i) in rows" :key="'l' + r.chip" class="launch-line fade" :style="{ '--d': `${0.3 + i * 0.5}s` }">
        <line :x1="sx(r.launch)" :x2="sx(r.launch)" :y1="TOP + 4" :y2="H - 4" />
      </g>

      <g v-for="(r, i) in rows" :key="r.chip" class="row fade" :style="{ '--d': `${0.3 + i * 0.5}s` }">
        <!-- row label -->
        <text x="0" :y="ry(i) - 2" class="gpu">{{ r.gpu }}</text>
        <text x="0" :y="ry(i) + 14" class="chip">{{ r.chip }} · {{ r.launchL }}</text>
        <!-- launch → software catches up -->
        <rect :x="sx(r.launch)" :y="ry(i) - 11" :width="sx(r.done) - sx(r.launch)" height="22" rx="11" :fill="`url(#fat-${r.chip})`" class="span" :style="{ '--d': `${0.5 + i * 0.5}s` }" />
        <circle :cx="sx(r.launch)" :cy="ry(i)" r="5" class="launch" :style="{ stroke: r.tint }" />
        <!-- FlashAttention versions on this GPU -->
        <g v-for="m in r.marks" :key="m.fa" class="mark fade" :style="{ '--d': `${1.0 + i * 0.5}s` }">
          <circle :cx="sx(m.at)" :cy="ry(i)" :r="m.final ? 7 : 5" :class="m.final ? 'final' : 'early'" :style="m.final ? { fill: r.tint } : { stroke: r.tint }" />
          <text :x="sx(m.at)" :y="ry(i) - 17" class="fa" text-anchor="middle">{{ m.fa }}</text>
          <text v-if="m.u" :x="sx(m.at)" :y="ry(i) + 27" class="u" :class="{ big: m.final }" text-anchor="middle">{{ m.u }}</text>
        </g>
        <!-- the lag -->
        <text :x="sx(r.done) + 16" :y="ry(i) + 5" class="lag fade" :style="{ '--d': `${1.3 + i * 0.5}s` }">{{ lag(r) }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.fat svg { width: 100%; height: auto; overflow: visible; }
.yr { font-family: var(--mono); font-size: 11px; fill: var(--slidev-theme-ink-secondary); }
.yr-grid { stroke: var(--slidev-theme-border-soft); }
.launch-line line { stroke: var(--slidev-theme-ink); stroke-width: 1; stroke-dasharray: 3 4; opacity: 0.35; }
.gpu { font-family: 'Instrument Serif', serif; font-size: 22px; fill: var(--slidev-theme-ink); }
.chip { font-family: var(--mono); font-size: 10.5px; fill: var(--slidev-theme-ink-secondary); }
.span { transform: scaleX(0); transform-origin: left; transform-box: fill-box; transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1); transition-delay: var(--d); }
.on .span { transform: scaleX(1); }
.launch { fill: var(--slidev-theme-bg); stroke-width: 2.5; }
.final { stroke: white; stroke-width: 2; }
.early { fill: var(--slidev-theme-bg); stroke-width: 2; }
.fa { font-family: var(--mono); font-size: 11px; font-weight: 700; fill: var(--slidev-theme-ink); }
.u { font-family: var(--mono); font-size: 10.5px; fill: var(--slidev-theme-ink-secondary); }
.u.big { font-size: 12.5px; font-weight: 700; fill: var(--slidev-theme-ink); }
.lag { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 20px; fill: #b45309; }

.fade { opacity: 0; transition: opacity 0.5s ease; transition-delay: var(--d); }
.on .fade { opacity: 1; }
.instant .fade, .instant .span { transition: none !important; }
</style>
