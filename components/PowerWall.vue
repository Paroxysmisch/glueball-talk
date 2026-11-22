<script setup lang="ts">
/**
 * Slide 3 — why we cannot simply add power.
 * Left: lead times for the physical infrastructure behind new power (IEA, Key Questions on Energy and AI, Apr 2026,
 *   §1.3 "Physical bottlenecks": grid connections 5–10 yrs in many jurisdictions; new transmission lines 4–8 yrs in
 *   advanced economies; gas-turbine deliveries ~5 yrs (Wood Mackenzie); transformers 2–3 yrs), against NVIDIA's
 *   one-year cadence of new GPU generations.
 * Right: rack power per NVIDIA system generation (vendor specs): 4x DGX A100 (4 x 6.5 kW = 26 kW), 4x DGX H100
 *   (40.8 kW, DGX SuperPOD H100 design guide), GB200 NVL72 (120 kW) and GB300 NVL72 (135 kW) (NVIDIA Mission Control),
 *   Vera Rubin NVL72 (187 kW Max-Q), Rubin Ultra NVL576 "Kyber" (~600 kW, announced GTC 2025). Air cooling becomes
 *   impractical above ~50 kW per rack (Uptime Institute); the average data-centre rack is ~9 kW (Uptime survey 2025).
 * Animates in when the slide appears.
 */
import { useAutoplay } from '../utils/autoplay'

const { on, instant } = useAutoplay(250)

const W = 470, H = 250

// ---------- left: lead times ----------
const LX0 = 112, LX1 = 400
const lx = (y: number) => LX0 + (y / 10) * (LX1 - LX0)
const leads = [
  { n: 'Grid connection', a: 5, b: 10, l: '5–10 yrs' },
  { n: 'Transmission line', a: 4, b: 8, l: '4–8 yrs' },
  { n: 'Gas turbine', a: 5, b: 5, l: '~5 yrs' },
  { n: 'Transformer', a: 2, b: 3, l: '2–3 yrs' },
]
const ROW0 = 52, ROWH = 44, BH = 20, LAX = ROW0 + (leads.length - 1) * ROWH + 30

// ---------- right: rack power ----------
const RX0 = 40, RX1 = 452, RT = 14, RB = 210, RMAX = 650
const racks = [
  { n: 'A100', y: 2020, kw: 26 },
  { n: 'H100', y: 2022, kw: 41 },
  { n: 'GB200', y: 2024, kw: 120 },
  { n: 'GB300', y: 2025, kw: 135 },
  { n: 'Rubin', y: 2026, kw: 187, l: '~190' },
  { n: 'Rubin Ultra', y: 2027, kw: 600, l: '~600', ann: true },
]
const rx = (i: number) => RX0 + ((i + 0.5) / racks.length) * (RX1 - RX0)
const ry = (kw: number) => RB - (kw / RMAX) * (RB - RT)
const RBW = 38
const AIR = 50
</script>

<template>
  <div class="pw" :class="{ on, instant }">
    <!-- lead times -->
    <div class="panel">
      <div class="head">
        <span class="t">Power infrastructure takes years</span>
        <span class="s">typical lead times · IEA (2026)</span>
      </div>
      <svg :viewBox="`0 0 ${W} ${H}`" class="area" xmlns="http://www.w3.org/2000/svg">
        <line v-for="y in [0, 2, 4, 6, 8, 10]" :key="'lg' + y" :x1="lx(y)" :x2="lx(y)" :y1="ROW0 - 22" :y2="LAX" class="gridline" />
        <text v-for="y in [0, 2, 4, 6, 8, 10]" :key="'lt' + y" :x="lx(y)" :y="LAX + 14" class="tick" text-anchor="middle">{{ y }}{{ y === 10 ? ' yrs' : '' }}</text>
        <g v-for="(r, i) in leads" :key="r.n" class="lead" :style="{ '--d': `${0.3 + i * 0.12}s` }">
          <text :x="LX0 - 8" :y="ROW0 + i * ROWH + 4" class="row-n" text-anchor="end">{{ r.n }}</text>
          <rect :x="lx(0)" :y="ROW0 + i * ROWH - BH / 2" :width="lx(r.a) - lx(0)" :height="BH" rx="4" class="lead-bar" />
          <rect v-if="r.b > r.a" :x="lx(r.a)" :y="ROW0 + i * ROWH - BH / 2" :width="lx(r.b) - lx(r.a)" :height="BH" rx="4" class="lead-rng" />
          <text :x="lx(r.b) + 6" :y="ROW0 + i * ROWH + 4" class="row-v">{{ r.l }}</text>
        </g>
        <g class="lbl">
          <line :x1="lx(1)" :x2="lx(1)" :y1="ROW0 - 26" :y2="LAX" class="cad" />
          <text :x="lx(1) + 5" :y="ROW0 - 28" class="cad-l">new GPU generation every ~1 yr</text>
        </g>
        <line :x1="lx(0)" :x2="lx(10)" :y1="LAX" :y2="LAX" class="axis" />
      </svg>
    </div>

    <!-- rack power -->
    <div class="panel">
      <div class="head">
        <span class="t">Racks outgrow air cooling</span>
        <span class="s">power per rack, kW · NVIDIA systems · typical data-centre rack ≈ 9 kW</span>
      </div>
      <svg :viewBox="`0 0 ${W} ${H}`" class="area" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pw-rack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f87171" stop-opacity="0.7" />
            <stop offset="100%" stop-color="#fecaca" stop-opacity="0.6" />
          </linearGradient>
        </defs>
        <line v-for="v in [0, 200, 400, 600]" :key="'rg' + v" :x1="RX0" :x2="RX1" :y1="ry(v)" :y2="ry(v)" class="gridline" />
        <text v-for="v in [0, 200, 400, 600]" :key="'rt' + v" :x="RX0 - 6" :y="ry(v) + 3" class="tick" text-anchor="end">{{ v }}</text>
        <g v-for="(r, i) in racks" :key="r.n">
          <rect class="rbar" :class="{ ann: r.ann }" :x="rx(i) - RBW / 2" :y="ry(r.kw)" :width="RBW" :height="RB - ry(r.kw)" rx="4" :style="{ '--d': `${0.3 + i * 0.12}s` }" />
          <text :x="rx(i)" :y="Math.min(ry(r.kw), ry(AIR)) - 5" class="rv" text-anchor="middle" :style="{ '--d': `${1 + i * 0.12}s` }">{{ r.l ?? r.kw }}</text>
          <text :x="rx(i)" :y="RB + 14" class="rn" text-anchor="middle">{{ r.n }}</text>
          <text :x="rx(i)" :y="RB + 26" class="tick" text-anchor="middle">{{ r.y }}</text>
        </g>
        <g class="lbl">
          <line :x1="RX0" :x2="RX1" :y1="ry(AIR)" :y2="ry(AIR)" class="air" />
          <text :x="RX0 + 4" :y="ry(AIR) - 22" class="air-l">air-cooling limit ≈ 50 kW</text>
        </g>
        <line :x1="RX0" :x2="RX1" :y1="RB" :y2="RB" class="axis" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.pw { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px 40px; margin-top: 2px; }
.head { display: flex; flex-direction: column; margin-bottom: 10px; white-space: nowrap; }
.head .t { font-family: 'Instrument Serif', serif; font-size: 24px; line-height: 1.1; color: var(--slidev-theme-ink); }
.head .s { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12px; color: var(--slidev-theme-ink-secondary); }

.area { width: 100%; height: auto; overflow: visible; }
.gridline { stroke: var(--slidev-theme-border); }
.axis { stroke: var(--slidev-theme-ink); opacity: 0.5; }
.tick { font-family: var(--mono); font-size: 9.5px; fill: var(--slidev-theme-ink-secondary); }
.lbl { opacity: 0; transition: opacity 0.5s ease 1.6s; }
.on .lbl { opacity: 1; }

/* lead times */
.row-n { font-family: 'Source Serif 4', serif; font-size: 12.5px; fill: var(--slidev-theme-ink); }
.row-v { font-family: var(--mono); font-size: 11.5px; font-weight: 700; fill: #0d9488; }
.lead-bar { fill: #0d9488; opacity: 0.8; }
.lead-rng { fill: #0d9488; opacity: 0.3; }
.lead { opacity: 0; transform: translateX(-8px); transition: opacity 0.5s ease, transform 0.5s ease; transition-delay: var(--d); }
.on .lead { opacity: 1; transform: none; }
.cad { stroke: var(--slidev-theme-primary); stroke-width: 1.8; stroke-dasharray: 4 3; }
.cad-l { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12px; fill: var(--slidev-theme-primary); }

/* racks */
.rbar { fill: url(#pw-rack); transform: scaleY(0); transform-origin: bottom; transform-box: fill-box; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); transition-delay: var(--d); }
.rbar.ann { fill-opacity: 0.45; stroke: #f87171; stroke-width: 1.2; stroke-dasharray: 4 3; }
.on .rbar { transform: scaleY(1); }
.rv { font-family: var(--mono); font-size: 11.5px; font-weight: 700; fill: var(--slidev-theme-ink); opacity: 0; transition: opacity 0.3s ease; transition-delay: var(--d); }
.on .rv { opacity: 1; }
.rn { font-family: 'Source Serif 4', serif; font-size: 11.5px; fill: var(--slidev-theme-ink); }
.air { stroke: var(--slidev-theme-secondary); stroke-width: 1.6; stroke-dasharray: 5 3; }
.air-l { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12px; fill: #0891b2; }

.instant .lead, .instant .rbar, .instant .rv, .instant .lbl { transition: none !important; }
</style>
