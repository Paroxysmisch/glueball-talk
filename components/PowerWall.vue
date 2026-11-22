<script setup lang="ts">
/**
 * Slide 3 — why power alone cannot pay for the compute, and where the rest must come from.
 * Left, top: lead times for the physical infrastructure behind new power (IEA, Key Questions on Energy and AI, Apr 2026,
 *   §1.3 "Physical bottlenecks": grid connections 5–10 yrs in many jurisdictions; new transmission lines 4–8 yrs in
 *   advanced economies; gas-turbine deliveries ~5 yrs (Wood Mackenzie); transformers 2–3 yrs), against NVIDIA's
 *   one-year cadence of new GPU generations.
 * Left, bottom: rack power per NVIDIA system generation (vendor specs): 4x DGX A100 (4 x 6.5 kW = 26 kW), 4x DGX H100
 *   (40.8 kW, DGX SuperPOD H100 design guide), GB200 NVL72 (120 kW) and GB300 NVL72 (135 kW) (NVIDIA Mission Control),
 *   Vera Rubin NVL72 (187 kW Max-Q), Rubin Ultra NVL576 "Kyber" (~600 kW, announced GTC 2025). Air cooling becomes
 *   impractical above ~50 kW per rack (Uptime Institute); the average data-centre rack is ~9 kW (Uptime survey 2025).
 * Right: AI compute demand 2024 -> 2030, decomposed multiplicatively (so additively on a log scale):
 *   demand    = 2.25^(t-2024)  (AI 2027 compute forecast, global AI compute; extended past 2027) -> x130
 *   power     = AI-focused data-centre electricity (IEA, Apr 2026: +50% in 2025, tripling 2025 -> 2030) -> x4.5
 *   node      = TSMC perf/W at the leading node vs N3E (N2 2025, A16 2027, A14 2028, A12 2029 assumed like A14) -> x2.3
 *   architecture & software = the remainder -> x13
 */
import { useAutoplay } from '../utils/autoplay'

const { on, instant } = useAutoplay(250)

// ---------- left top: lead times ----------
const LW = 470, LH = 112, LX0 = 118, LX1 = 418
const lx = (y: number) => LX0 + (y / 10) * (LX1 - LX0)
const leads = [
  { n: 'Grid connection', a: 5, b: 10, l: '5–10 yrs' },
  { n: 'Transmission line', a: 4, b: 8, l: '4–8 yrs' },
  { n: 'Gas turbine', a: 5, b: 5, l: '~5 yrs' },
  { n: 'Transformer', a: 2, b: 3, l: '2–3 yrs' },
]
const ROW0 = 22, ROWH = 19, LAX = ROW0 + leads.length * ROWH + 2

// ---------- left bottom: rack power ----------
const RW = 470, RH = 136, RX0 = 40, RX1 = 440, RT = 8, RB = 108, RMAX = 650
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
const RBW = 30
const AIR = 50

// ---------- right: decomposition of compute demand ----------
const W = 470, H = 292, PX = 34, PR = 360, PT = 10, PB = 266
const Y0 = 2024, Y1 = 2030
const demandAt = (t: number) => 2.25 ** (t - Y0)
const powerAt = (t: number) => (t <= 2025 ? 1.5 ** (t - Y0) : 1.5 * 3 ** ((t - 2025) / 5))
const NODES = [
  { y: 2024, f: 1, n: '' },
  { y: 2025, f: 1.38, n: 'N2' },
  { y: 2027, f: 1.67, n: 'A16' },
  { y: 2028, f: 1.9, n: 'A14' },
  { y: 2029, f: 2.3, n: 'A12' },
]
const nodeAt = (t: number) => NODES.filter(n => n.y <= t + 1e-9).at(-1)!.f
const VMAX = 200
const sx = (t: number) => PX + ((t - Y0) / (Y1 - Y0)) * (PR - PX)
const sy = (v: number) => PB - (Math.log10(v) / Math.log10(VMAX)) * (PB - PT)
// sample times: a fine grid plus both sides of every node step
const EPS = 1e-4
const ts = [...new Set([
  ...Array.from({ length: 121 }, (_, i) => Y0 + (i / 120) * (Y1 - Y0)),
  ...NODES.slice(1).flatMap(n => [n.y - EPS, n.y]),
])].sort((a, b) => a - b)
const P = (f: (t: number) => number) => ts.map(t => `${sx(t).toFixed(1)},${sy(f(t)).toFixed(1)}`)
const powerTop = P(powerAt)
const nodeTop = P(t => powerAt(t) * nodeAt(t))
const demandTop = P(demandAt)
const rev = (a: string[]) => a.slice().reverse()
const powerArea = `M${sx(Y0)},${sy(1)} L${powerTop.join(' L')} L${sx(Y1)},${sy(1)} Z`
const nodeArea = `M${nodeTop.join(' L')} L${rev(powerTop).join(' L')} Z`
const archArea = `M${demandTop.join(' L')} L${rev(nodeTop).join(' L')} Z`
const line = (a: string[]) => `M${a.join(' L')}`
const DEM = demandAt(Y1), POW = powerAt(Y1), NODE = nodeAt(Y1), ARCH = DEM / (POW * NODE)
const mid = (a: number, b: number) => (sy(a) + sy(b)) / 2
</script>

<template>
  <div class="pw" :class="{ on, instant }">
    <div class="left">
      <!-- lead times -->
      <div class="panel">
        <div class="head sm">
          <span class="t">Power infrastructure takes years</span>
          <span class="s">typical lead times · IEA (2026)</span>
        </div>
        <svg :viewBox="`0 0 ${LW} ${LH}`" class="area" xmlns="http://www.w3.org/2000/svg">
          <line v-for="y in [0, 2, 4, 6, 8, 10]" :key="'lg' + y" :x1="lx(y)" :x2="lx(y)" :y1="ROW0 - 8" :y2="LAX" class="gridline" />
          <text v-for="y in [0, 2, 4, 6, 8, 10]" :key="'lt' + y" :x="lx(y)" :y="LAX + 11" class="tick" text-anchor="middle">{{ y }}{{ y === 10 ? ' yrs' : '' }}</text>
          <g v-for="(r, i) in leads" :key="r.n" class="lead" :style="{ '--d': `${0.3 + i * 0.12}s` }">
            <text :x="LX0 - 8" :y="ROW0 + i * ROWH + 4" class="row-n" text-anchor="end">{{ r.n }}</text>
            <rect :x="lx(0)" :y="ROW0 + i * ROWH - 6" :width="lx(r.a) - lx(0)" height="12" rx="3" class="lead-bar" />
            <rect v-if="r.b > r.a" :x="lx(r.a)" :y="ROW0 + i * ROWH - 6" :width="lx(r.b) - lx(r.a)" height="12" rx="3" class="lead-rng" />
            <text :x="lx(r.b) + 5" :y="ROW0 + i * ROWH + 4" class="row-v">{{ r.l }}</text>
          </g>
          <!-- GPU cadence -->
          <g class="lbl">
            <line :x1="lx(1)" :x2="lx(1)" :y1="ROW0 - 12" :y2="LAX" class="cad" />
            <text :x="lx(1) + 4" :y="ROW0 - 13" class="cad-l">new GPU generation every ~1 yr</text>
          </g>
          <line :x1="lx(0)" :x2="lx(10)" :y1="LAX" :y2="LAX" class="axis" />
        </svg>
      </div>

      <!-- rack power -->
      <div class="panel">
        <div class="head sm">
          <span class="t">Racks outgrow air cooling</span>
          <span class="s">power per rack, kW · NVIDIA systems · typical data-centre rack ≈ 9 kW</span>
        </div>
        <svg :viewBox="`0 0 ${RW} ${RH}`" class="area" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pw-rack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#e11d48" stop-opacity="0.85" />
              <stop offset="100%" stop-color="var(--slidev-theme-accent)" stop-opacity="0.85" />
            </linearGradient>
          </defs>
          <line v-for="v in [0, 200, 400, 600]" :key="'rg' + v" :x1="RX0" :x2="RX1" :y1="ry(v)" :y2="ry(v)" class="gridline" />
          <text v-for="v in [0, 200, 400, 600]" :key="'rt' + v" :x="RX0 - 6" :y="ry(v) + 3" class="tick" text-anchor="end">{{ v }}</text>
          <g v-for="(r, i) in racks" :key="r.n">
            <rect class="rbar" :class="{ ann: r.ann }" :x="rx(i) - RBW / 2" :y="ry(r.kw)" :width="RBW" :height="RB - ry(r.kw)" rx="3" :style="{ '--d': `${0.3 + i * 0.12}s` }" />
            <text :x="rx(i)" :y="Math.min(ry(r.kw), ry(AIR)) - 4" class="rv" text-anchor="middle" :style="{ '--d': `${1 + i * 0.12}s` }">{{ r.l ?? r.kw }}</text>
            <text :x="rx(i)" :y="RB + 11" class="rn" text-anchor="middle">{{ r.n }}</text>
            <text :x="rx(i)" :y="RB + 21" class="tick" text-anchor="middle">{{ r.y }}</text>
          </g>
          <g class="lbl">
            <line :x1="RX0" :x2="RX1" :y1="ry(AIR)" :y2="ry(AIR)" class="air" />
            <text :x="RX0 + 4" :y="ry(AIR) - 18" class="air-l">air-cooling limit ≈ 50 kW</text>
          </g>
          <line :x1="RX0" :x2="RX1" :y1="RB" :y2="RB" class="axis" />
        </svg>
      </div>
    </div>

    <!-- right: decomposition -->
    <div class="panel">
      <div class="head">
        <span class="t">Where the 2030 compute must come from</span>
        <span class="s">AI compute demand relative to 2024, log scale · stacked by source</span>
      </div>
      <svg :viewBox="`0 0 ${W} ${H}`" class="area" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="pw-reveal"><rect class="reveal" :x="PX - 2" y="0" :width="PR - PX + 4" :height="H" /></clipPath>
          <linearGradient id="pw-arch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--slidev-theme-accent)" stop-opacity="0.6" />
            <stop offset="100%" stop-color="var(--slidev-theme-accent)" stop-opacity="0.25" />
          </linearGradient>
          <linearGradient id="pw-node" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--slidev-theme-primary)" stop-opacity="0.5" />
            <stop offset="100%" stop-color="var(--slidev-theme-primary)" stop-opacity="0.25" />
          </linearGradient>
          <linearGradient id="pw-power" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0d9488" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#0d9488" stop-opacity="0.18" />
          </linearGradient>
        </defs>
        <line v-for="v in [1, 10, 100]" :key="'g' + v" :x1="PX" :x2="PR" :y1="sy(v)" :y2="sy(v)" class="gridline" />
        <text v-for="v in [1, 10, 100]" :key="'t' + v" :x="PX - 6" :y="sy(v) + 3" class="tick" text-anchor="end">{{ v }}×</text>
        <text v-for="y in [2024, 2026, 2028, 2030]" :key="y" :x="sx(y)" :y="PB + 15" class="tick" text-anchor="middle">{{ y }}</text>
        <g clip-path="url(#pw-reveal)">
          <path :d="archArea" fill="url(#pw-arch)" />
          <path :d="nodeArea" fill="url(#pw-node)" />
          <path :d="powerArea" fill="url(#pw-power)" />
          <path :d="line(powerTop)" class="power-line" />
          <path :d="line(nodeTop)" class="node-line" />
          <path :d="line(demandTop)" class="demand-line" />
        </g>
        <line :x1="PX" :x2="PR" :y1="PB" :y2="PB" class="axis" />
        <g class="lbl">
          <text :x="PR + 8" :y="sy(DEM) + 4" class="l-dem"><tspan class="l-v">×{{ Math.round(DEM) }}</tspan> demand</text>
          <text :x="PR + 8" :y="mid(DEM, POW * NODE) - 2" class="l-arch"><tspan class="l-v">×{{ Math.round(ARCH) }}</tspan> architecture</text>
          <text :x="PR + 8" :y="mid(DEM, POW * NODE) + 12" class="l-arch">&amp; software</text>
          <text :x="PR + 8" :y="mid(POW * NODE, POW) + 4" class="l-node"><tspan class="l-v">×{{ NODE.toFixed(1) }}</tspan> process node</text>
          <text :x="PR + 8" :y="mid(POW, 1) + 4" class="l-pow"><tspan class="l-v">×{{ POW.toFixed(1) }}</tspan> more power</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.pw { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px 40px; margin-top: 2px; }
.left { display: flex; flex-direction: column; gap: 6px; }
.head { display: flex; flex-direction: column; margin-bottom: 8px; white-space: nowrap; }
.head .t { font-family: 'Instrument Serif', serif; font-size: 24px; line-height: 1.1; color: var(--slidev-theme-ink); }
.head .s { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12px; color: var(--slidev-theme-ink-secondary); }
.head.sm { margin-bottom: 2px; }
.head.sm .t { font-size: 19px; }
.head.sm .s { font-size: 11px; }

.area { width: 100%; height: auto; overflow: visible; }
.gridline { stroke: var(--slidev-theme-border); }
.axis { stroke: var(--slidev-theme-ink); opacity: 0.5; }
.tick { font-family: var(--mono); font-size: 9px; fill: var(--slidev-theme-ink-secondary); }

/* lead times */
.row-n { font-family: 'Source Serif 4', serif; font-size: 11px; fill: var(--slidev-theme-ink); }
.row-v { font-family: var(--mono); font-size: 10px; font-weight: 700; fill: #0d9488; }
.lead-bar { fill: #0d9488; opacity: 0.8; }
.lead-rng { fill: #0d9488; opacity: 0.3; }
.lead { opacity: 0; transform: translateX(-8px); transition: opacity 0.5s ease, transform 0.5s ease; transition-delay: var(--d); }
.on .lead { opacity: 1; transform: none; }
.cad { stroke: var(--slidev-theme-primary); stroke-width: 1.6; stroke-dasharray: 3 2; }
.cad-l { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 10.5px; fill: var(--slidev-theme-primary); }

/* racks */
.rbar { fill: url(#pw-rack); transform: scaleY(0); transform-origin: bottom; transform-box: fill-box; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); transition-delay: var(--d); }
.rbar.ann { fill-opacity: 0.45; stroke: #e11d48; stroke-width: 1; stroke-dasharray: 3 2; }
.on .rbar { transform: scaleY(1); }
.rv { font-family: var(--mono); font-size: 10px; font-weight: 700; fill: var(--slidev-theme-ink); opacity: 0; transition: opacity 0.3s ease; transition-delay: var(--d); }
.on .rv { opacity: 1; }
.rn { font-family: 'Source Serif 4', serif; font-size: 10px; fill: var(--slidev-theme-ink); }
.air { stroke: #2563eb; stroke-width: 1.4; stroke-dasharray: 5 3; }
.air-l { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 10.5px; fill: #2563eb; }

/* decomposition */
.reveal { transform: scaleX(0); transform-origin: left; transform-box: fill-box; transition: transform 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s; }
.on .reveal { transform: scaleX(1); }
.power-line { fill: none; stroke: #0d9488; stroke-width: 1.6; }
.node-line { fill: none; stroke: var(--slidev-theme-primary); stroke-width: 1.6; }
.demand-line { fill: none; stroke: var(--slidev-theme-ink); stroke-width: 2.2; }
.lbl { opacity: 0; transition: opacity 0.5s ease 2.2s; }
.on .lbl { opacity: 1; }
.l-v { font-family: var(--mono); font-weight: 700; font-size: 12px; }
.l-dem, .l-arch, .l-node, .l-pow { font-family: 'Source Serif 4', serif; font-size: 11px; }
.l-dem { fill: var(--slidev-theme-ink); }
.l-arch { fill: #b45309; }
.l-arch .l-v { font-size: 15px; }
.l-node { fill: var(--slidev-theme-primary); }
.l-pow { fill: #0d9488; }
.instant .lead, .instant .rbar, .instant .rv, .instant .reveal, .instant .lbl { transition: none !important; }
</style>
