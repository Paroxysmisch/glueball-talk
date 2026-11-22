<script setup lang="ts">
/**
 * Slide 2 — demand for AI compute, for training (left) and inference (right).
 * Left: notable AI models trained with >10^27 FLOP, cumulative, Epoch AI median projection
 *       (values decoded from the "counts-over-time-cumulative" chart of
 *        https://epoch.ai/publications/model-counts-compute-thresholds; the same decoding reproduces the
 *        article's quoted 10^26 figures: ~34 by 2027, ~239 by 2030).
 * Right: global AI tokens processed per month, LINEAR scale, Goldman Sachs Research ("Decoding the Agentic Economy",
 *        May 2026; figures as reported by GS Insights and I/O Fund): ~1.7Q (mid-2025, estimate), ~5.6Q (May 2026,
 *        estimate), ~47Q (2028, forecast), ~120Q (mid-2030, forecast; "24x" from 2026). Between the published points
 *        the curve is interpolated geometrically (constant growth rate), so it has no extra data in it.
 * Animates in when the slide appears.
 */
import { useAutoplay } from '../utils/autoplay'

const { on, instant } = useAutoplay(250)

const W = 470, H = 226, PX = 34, PR = 382, PT = 10, PB = 200

// ---- left: models above 10^27 FLOP ----
const models = [
  { y: 2024, v: 0 }, { y: 2025, v: 0 }, { y: 2026, v: 0 },
  { y: 2027, v: 6 }, { y: 2028, v: 25 }, { y: 2029, v: 64 }, { y: 2030, v: 124 },
]
const MAXM = 140
const sx = (t: number) => PX + ((t - 2024) / 6) * (PR - PX)
const cy = (v: number) => PB - (v / MAXM) * (PB - PT)
const BW = 24

// ---- right: tokens per month (quadrillions), linear ----
const T0 = 2025, T1 = 2030.5, MAXT = 130
const knots = [
  { t: 2025.5, v: 1.7, l: '1.7Q', est: true },
  { t: 2026 + 4.5 / 12, v: 5.6, l: '5.6Q', est: true },
  { t: 2028.5, v: 47, l: '47Q', est: false },
  { t: 2030.5, v: 120, l: '120Q', est: false },
]
const NOW = knots[1].t
const tx = (t: number) => PX + ((t - T0) / (T1 - T0)) * (PR - PX)
const ty = (v: number) => PB - (v / MAXT) * (PB - PT)
// geometric interpolation between published points
const tokAt = (t: number) => {
  for (let i = 0; i < knots.length - 1; i++) {
    const a = knots[i], b = knots[i + 1]
    if (t <= b.t + 1e-9) return a.v * (b.v / a.v) ** ((t - a.t) / (b.t - a.t))
  }
  return knots.at(-1)!.v
}
const curve = (a: number, b: number, n = 60) =>
  Array.from({ length: n + 1 }, (_, i) => a + (i / n) * (b - a)).map(t => `${tx(t).toFixed(1)},${ty(tokAt(t)).toFixed(1)}`)
const pastPts = curve(knots[0].t, NOW, 12)
const futPts = curve(NOW, knots.at(-1)!.t, 80)
const pastLine = `M${pastPts.join(' L')}`
const futLine = `M${futPts.join(' L')}`
const tokArea = `M${tx(knots[0].t)},${PB} L${[...pastPts, ...futPts].join(' L')} L${tx(knots.at(-1)!.t)},${PB} Z`
const GROWTH = Math.round(knots.at(-1)!.v / knots[0].v / 10) * 10 // ~70
</script>

<template>
  <div class="cd" :class="{ on, instant }">
    <!-- left: models above 10^27 FLOP -->
    <div class="panel">
      <div class="head">
        <span class="t">Training: models trained with &gt;10<sup>27</sup> FLOP</span>
        <span class="s">cumulative count · Epoch AI median projection</span>
      </div>
      <svg :viewBox="`0 0 ${W} ${H}`" class="area" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cd-bars" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--slidev-theme-secondary)" />
            <stop offset="100%" stop-color="var(--slidev-theme-primary)" />
          </linearGradient>
        </defs>
        <line v-for="v in [0, 50, 100]" :key="'g' + v" :x1="PX" :x2="PR" :y1="cy(v)" :y2="cy(v)" class="gridline" />
        <text v-for="v in [0, 50, 100]" :key="'t' + v" :x="PX - 6" :y="cy(v) + 3" class="tick" text-anchor="end">{{ v }}</text>
        <text v-for="y in [2024, 2026, 2028, 2030]" :key="y" :x="sx(y)" :y="PB + 15" class="tick" text-anchor="middle">{{ y }}</text>
        <g v-for="(m, i) in models" :key="m.y">
          <rect class="cbar" :x="sx(m.y) - BW / 2" :y="cy(m.v)" :width="BW" :height="PB - cy(m.v)" rx="4" :style="{ '--d': `${0.25 + i * 0.1}s` }" />
          <text v-if="m.v" :x="sx(m.y)" :y="cy(m.v) - 5" class="cv" text-anchor="middle" :style="{ '--d': `${0.95 + i * 0.1}s` }">{{ m.v }}</text>
        </g>
        <line :x1="PX" :x2="PR" :y1="PB" :y2="PB" class="axis" />
      </svg>
    </div>

    <!-- right: tokens per month, linear -->
    <div class="panel">
      <div class="head">
        <span class="t">Inference: AI tokens processed per month</span>
        <span class="s">worldwide, quadrillions · Goldman Sachs estimates and forecast</span>
      </div>
      <svg :viewBox="`0 0 ${W} ${H}`" class="area" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="cd-reveal"><rect class="reveal" :x="PX - 2" y="0" :width="PR - PX + 40" :height="H" /></clipPath>
          <linearGradient id="cd-tok" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--slidev-theme-secondary)" stop-opacity="0.5" />
            <stop offset="100%" stop-color="var(--slidev-theme-primary)" stop-opacity="0.12" />
          </linearGradient>
        </defs>
        <line v-for="v in [0, 40, 80, 120]" :key="'g' + v" :x1="PX" :x2="PR" :y1="ty(v)" :y2="ty(v)" class="gridline" />
        <text v-for="v in [0, 40, 80, 120]" :key="'t' + v" :x="PX - 6" :y="ty(v) + 3" class="tick" text-anchor="end">{{ v }}Q</text>
        <text v-for="y in [2025, 2026, 2027, 2028, 2029, 2030]" :key="y" :x="tx(y)" :y="PB + 15" class="tick" text-anchor="middle">{{ y }}</text>
        <!-- "today" marker: estimates to the left, forecast to the right -->
        <line :x1="tx(NOW)" :x2="tx(NOW)" :y1="ty(40)" :y2="PB" class="now" />
        <text :x="tx(NOW) - 4" :y="ty(40) + 4" class="now-l" text-anchor="end">estimate</text>
        <text :x="tx(NOW) + 4" :y="ty(40) + 4" class="now-l">forecast →</text>
        <g clip-path="url(#cd-reveal)">
          <path :d="tokArea" fill="url(#cd-tok)" />
          <path :d="pastLine" class="tok-line" />
          <path :d="futLine" class="tok-line fut" />
          <g v-for="k in knots" :key="k.l">
            <circle :cx="tx(k.t)" :cy="ty(k.v)" r="3.2" class="tok-dot" />
            <text :x="tx(k.t) + (k.v > 100 ? 0 : -6)" :y="ty(k.v) - 7" class="tok-v" :text-anchor="k.v > 100 ? 'middle' : 'end'">{{ k.l }}</text>
          </g>
        </g>
        <line :x1="PX" :x2="PR" :y1="PB" :y2="PB" class="axis" />
        <g class="lbl">
          <text :x="tx(2025.15)" :y="ty(105)" class="l-tok"><tspan class="l-v">~×{{ GROWTH }}</tspan> in five years</text>
          <text :x="tx(2025.15)" :y="ty(105) + 14" class="l-sub">driven by agentic AI</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.cd { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px 40px; margin-top: 2px; }
.head { display: flex; flex-direction: column; margin-bottom: 10px; white-space: nowrap; }
.head .t { font-family: 'Instrument Serif', serif; font-size: 24px; line-height: 1.1; color: var(--slidev-theme-ink); }
.head .s { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12px; color: var(--slidev-theme-ink-secondary); }

.area { width: 100%; height: auto; overflow: visible; }
.gridline { stroke: var(--slidev-theme-border); }
.axis { stroke: var(--slidev-theme-ink); opacity: 0.5; }
.tick { font-family: var(--mono); font-size: 9px; fill: var(--slidev-theme-ink-secondary); }
.reveal { transform: scaleX(0); transform-origin: left; transform-box: fill-box; transition: transform 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s; }
.on .reveal { transform: scaleX(1); }
.tok-line { fill: none; stroke: #0891b2; stroke-width: 2.4; }
.tok-line.fut { stroke-dasharray: 5 4; }
.tok-dot { fill: #0891b2; }
.tok-v { font-family: var(--mono); font-size: 11px; font-weight: 700; fill: var(--slidev-theme-ink); }
.now { stroke: var(--slidev-theme-ink-secondary); stroke-dasharray: 2 3; opacity: 0.6; }
.now-l { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 10px; fill: var(--slidev-theme-ink-secondary); }
.lbl { opacity: 0; transition: opacity 0.5s ease 2.2s; }
.on .lbl { opacity: 1; }
.l-v { font-family: var(--mono); font-weight: 700; font-size: 13px; }
.l-tok { font-family: 'Source Serif 4', serif; font-size: 12px; fill: #0891b2; }
.l-sub { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 10.5px; fill: var(--slidev-theme-ink-secondary); }
.instant .cbar, .instant .cv, .instant .reveal, .instant .lbl { transition: none !important; }
.cbar { fill: url(#cd-bars); transform: scaleY(0); transform-origin: bottom; transform-box: fill-box; transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1); transition-delay: var(--d); }
.on .cbar { transform: scaleY(1); }
.cv { font-family: var(--mono); font-size: 11px; font-weight: 700; fill: var(--slidev-theme-ink); opacity: 0; transition: opacity 0.3s ease; transition-delay: var(--d); }
.on .cv { opacity: 1; }
</style>
