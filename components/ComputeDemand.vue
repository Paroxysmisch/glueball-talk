<script setup lang="ts">
/**
 * Slide 2 — demand for AI compute, for training (left) and inference (right).
 * Left: notable AI models trained with >10^27 FLOP, cumulative, Epoch AI median projection
 *       (values decoded from the "counts-over-time-cumulative" chart of
 *        https://epoch.ai/publications/model-counts-compute-thresholds; the same decoding reproduces the
 *        article's quoted 10^26 figures: ~34 by 2027, ~239 by 2030).
 * Right: global AI tokens processed per month, LINEAR scale, stacked by workload (non-agent / consumer agents /
 *        enterprise agents), Goldman Sachs Research (May 2026), values from the chart in the GS Insights article
 *        "AI Agents Forecast to Boost Tech Cash Flow as Usage Soars"; points joined by straight lines.
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

// ---- right: tokens per month (quadrillions), linear, stacked by workload ----
// Goldman Sachs Research, from the Flourish chart embedded in the GS Insights article (token-use-by-ai-agents):
// [non-agent, consumer agents, enterprise agents] per month. 2024-26 are estimates of today's usage, 2027+ forecasts.
// (The source labels the first point "01/04/0204", read as April 2024.)
const T0 = 2024, T1 = 2030.42, MAXT = 130
const ym = (y: number, m: number) => y + (m - 1) / 12
const data = [
  { t: ym(2024, 4), v: [0.142, 0, 0] },
  { t: ym(2025, 5), v: [1.707, 0, 0] },
  { t: ym(2026, 4), v: [5.575, 0, 0] },
  { t: ym(2027, 5), v: [7.885, 7.399, 13.588] },
  { t: ym(2028, 5), v: [10.697, 15.975, 20.365] },
  { t: ym(2029, 5), v: [13.462, 28.400, 32.316] },
  { t: ym(2030, 5), v: [16.281, 45.122, 56.251] },
].map(d => ({ ...d, total: d.v[0] + d.v[1] + d.v[2] }))
const tx = (t: number) => PX + ((t - T0) / (T1 - T0)) * (PR - PX)
const ty = (v: number) => PB - (v / MAXT) * (PB - PT)
// cumulative tops of each band (straight segments between published points)
const cum = (k: number) => data.map(d => d.v.slice(0, k + 1).reduce((a, b) => a + b, 0))
const tops = [0, 1, 2].map(cum)
const pts = (vals: number[]) => data.map((d, i) => `${tx(d.t).toFixed(1)},${ty(vals[i]).toFixed(1)}`)
const base = data.map(() => 0)
const bands = [
  { k: 'non', n: 'non-agent', lo: base, hi: tops[0] },
  { k: 'con', n: 'consumer agents', lo: tops[0], hi: tops[1] },
  { k: 'ent', n: 'enterprise agents', lo: tops[1], hi: tops[2] },
].map(b => ({ ...b, d: `M${pts(b.hi).join(' L')} L${pts(b.lo).reverse().join(' L')} Z`, mid: (b.lo.at(-1)! + b.hi.at(-1)!) / 2 }))
const totPts = pts(tops[2])
const pastLine = `M${totPts.slice(0, 3).join(' L')}`
const futLine = `M${totPts.slice(2).join(' L')}`
const fmtQ = (v: number) => (v < 1 ? v.toFixed(2) : v < 10 ? v.toFixed(1) : Math.round(v).toString()) + 'Q'
const GROWTH = Math.round(data.at(-1)!.total / data[1].total / 10) * 10 // ~70, May 2025 -> May 2030
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
        <span class="s">worldwide, quadrillions · Goldman Sachs estimates and forecast, by workload</span>
      </div>
      <svg :viewBox="`0 0 ${W} ${H}`" class="area" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="cd-reveal"><rect class="reveal" :x="PX - 2" y="0" :width="PR - PX + 40" :height="H" /></clipPath>
        </defs>
        <line v-for="v in [0, 40, 80, 120]" :key="'g' + v" :x1="PX" :x2="PR" :y1="ty(v)" :y2="ty(v)" class="gridline" />
        <text v-for="v in [0, 40, 80, 120]" :key="'t' + v" :x="PX - 6" :y="ty(v) + 3" class="tick" text-anchor="end">{{ v }}Q</text>
        <text v-for="y in [2024, 2025, 2026, 2027, 2028, 2029, 2030]" :key="y" :x="tx(y)" :y="PB + 15" class="tick" text-anchor="middle">{{ y }}</text>
        <g clip-path="url(#cd-reveal)">
          <path v-for="b in bands" :key="b.k" :d="b.d" class="band" :class="b.k" />
          <path :d="pastLine" class="tok-line" />
          <path :d="futLine" class="tok-line fut" />
          <g v-for="(d, i) in data" :key="d.t">
            <circle :cx="tx(d.t)" :cy="ty(d.total)" r="3" class="tok-dot" />
            <text :x="tx(d.t) + (i === 0 ? -3 : i === data.length - 1 ? 0 : -5)" :y="ty(d.total) - (i === 0 ? 24 : 7)" class="tok-v" :text-anchor="i === 0 ? 'start' : i === data.length - 1 ? 'middle' : 'end'">{{ fmtQ(d.total) }}</text>
          </g>
        </g>
        <line :x1="PX" :x2="PR" :y1="PB" :y2="PB" class="axis" />
        <g class="lbl">
          <text v-for="b in bands" :key="'l' + b.k" :x="PR + 8" :y="ty(b.mid) + 4" class="band-l" :class="b.k">{{ b.n }}</text>
          <text :x="tx(2024.1)" :y="ty(72)" class="l-tok"><tspan class="l-v">~×{{ GROWTH }}</tspan> in five years</text>
          <text :x="tx(2024.1)" :y="ty(72) + 14" class="l-sub">driven by agentic AI</text>
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
.band { stroke: #fff; stroke-width: 0.8; stroke-opacity: 0.8; }
.band.non { fill: #2dd4bf; fill-opacity: 0.45; }
.band.con { fill: #6366f1; fill-opacity: 0.38; }
.band.ent { fill: #f472b6; fill-opacity: 0.38; }
.band-l { font-family: 'Source Serif 4', serif; font-size: 10.5px; font-weight: 600; }
.band-l.non { fill: #0d9488; }
.band-l.con { fill: #4f46e5; }
.band-l.ent { fill: #db2777; }
.tok-dot { fill: #0891b2; }
.tok-v { font-family: var(--mono); font-size: 11px; font-weight: 700; fill: var(--slidev-theme-ink); }
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
