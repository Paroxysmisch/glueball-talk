<script setup lang="ts">
/**
 * Slide 4 — where the 2030 compute must come from.
 * AI compute demand 2024 -> 2030, decomposed multiplicatively (so additively on a log scale):
 *   demand    = 2.25^(t-2024)  (AI 2027 compute forecast, global AI compute; extended past 2027) -> x130
 *   power     = AI-focused data-centre electricity (IEA, Apr 2026: +50% in 2025, tripling 2025 -> 2030) -> x4.5
 *   node      = TSMC perf/W at the leading node vs N3E (N2 2025, A16 2027, A14 2028, A12 2029 assumed like A14) -> x2.3
 *   architecture & software = the remainder -> x13
 * Right: the same decomposition written as a product.
 * Animates in when the slide appears.
 */
import { useAutoplay } from '../utils/autoplay'

const { on, instant } = useAutoplay(250)

const W = 520, H = 224, PX = 34, PR = 410, PT = 10, PB = 200
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

const terms = [
  { v: `×${POW.toFixed(1)}`, n: 'more power', s: 'AI data-centre electricity, IEA', c: 'pow' },
  { v: `×${NODE.toFixed(1)}`, n: 'process node', s: 'TSMC roadmap, N3E → A12', c: 'node' },
  { v: `×${Math.round(ARCH)}`, n: 'architecture & software', s: 'everything else', c: 'arch' },
]
</script>

<template>
  <div class="cs" :class="{ on, instant }">
    <div class="panel">
      <div class="head">
        <span class="t">AI compute demand, stacked by source</span>
        <span class="s">relative to 2024, log scale</span>
      </div>
      <svg :viewBox="`0 0 ${W} ${H}`" class="area" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="cs-reveal"><rect class="reveal" :x="PX - 2" y="0" :width="PR - PX + 4" :height="H" /></clipPath>
          <linearGradient id="cs-arch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--slidev-theme-accent)" stop-opacity="0.6" />
            <stop offset="100%" stop-color="var(--slidev-theme-accent)" stop-opacity="0.25" />
          </linearGradient>
          <linearGradient id="cs-node" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--slidev-theme-primary)" stop-opacity="0.5" />
            <stop offset="100%" stop-color="var(--slidev-theme-primary)" stop-opacity="0.25" />
          </linearGradient>
          <linearGradient id="cs-power" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0d9488" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#0d9488" stop-opacity="0.18" />
          </linearGradient>
        </defs>
        <line v-for="v in [1, 10, 100]" :key="'g' + v" :x1="PX" :x2="PR" :y1="sy(v)" :y2="sy(v)" class="gridline" />
        <text v-for="v in [1, 10, 100]" :key="'t' + v" :x="PX - 6" :y="sy(v) + 3" class="tick" text-anchor="end">{{ v }}×</text>
        <text v-for="y in [2024, 2026, 2028, 2030]" :key="y" :x="sx(y)" :y="PB + 15" class="tick" text-anchor="middle">{{ y }}</text>
        <g clip-path="url(#cs-reveal)">
          <path :d="archArea" fill="url(#cs-arch)" />
          <path :d="nodeArea" fill="url(#cs-node)" />
          <path :d="powerArea" fill="url(#cs-power)" />
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

    <!-- the same thing as a product -->
    <div class="eq">
      <div class="eq-dem"><span class="v">×{{ Math.round(DEM) }}</span> <span class="n">compute demand by 2030</span></div>
      <div class="eq-eq">=</div>
      <template v-for="(t, i) in terms" :key="t.n">
        <div v-if="i" class="eq-x">×</div>
        <div class="term" :class="t.c" :style="{ '--d': `${0.6 + i * 0.35}s` }">
          <span class="v">{{ t.v }}</span>
          <span class="n">{{ t.n }}</span>
          <span class="s">{{ t.s }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.cs { display: grid; grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr); gap: 40px; align-items: center; margin-top: 2px; }
.head { display: flex; flex-direction: column; margin-bottom: 10px; white-space: nowrap; }
.head .t { font-family: 'Instrument Serif', serif; font-size: 24px; line-height: 1.1; color: var(--slidev-theme-ink); }
.head .s { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12px; color: var(--slidev-theme-ink-secondary); }

.area { width: 100%; height: auto; overflow: visible; }
.gridline { stroke: var(--slidev-theme-border); }
.axis { stroke: var(--slidev-theme-ink); opacity: 0.5; }
.tick { font-family: var(--mono); font-size: 9px; fill: var(--slidev-theme-ink-secondary); }
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

/* product */
.eq { display: flex; flex-direction: column; align-items: stretch; gap: 4px; }
.eq-dem { display: flex; align-items: baseline; gap: 8px; }
.eq-dem .v { font-family: var(--mono); font-weight: 700; font-size: 26px; color: var(--slidev-theme-ink); }
.eq-dem .n { font-family: 'Source Serif 4', serif; font-size: 14px; color: var(--slidev-theme-ink-secondary); }
.eq-eq, .eq-x { font-family: var(--mono); font-size: 16px; color: var(--slidev-theme-ink-secondary); padding-left: 14px; line-height: 1; }
.term {
  display: grid; grid-template-columns: 74px 1fr; column-gap: 10px; align-items: baseline;
  padding: 7px 12px; border-radius: 10px; border: 1px solid var(--c-b); background: var(--c-bg);
  opacity: 0; transform: translateY(6px); transition: opacity 0.5s ease, transform 0.5s ease; transition-delay: var(--d);
}
.on .term { opacity: 1; transform: none; }
.term .v { grid-row: span 2; font-family: var(--mono); font-weight: 700; font-size: 22px; color: var(--c); }
.term .n { font-family: 'Source Serif 4', serif; font-size: 14px; color: var(--slidev-theme-ink); }
.term .s { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 11px; color: var(--slidev-theme-ink-secondary); }
.term.pow { --c: #0d9488; --c-b: rgba(13, 148, 136, 0.3); --c-bg: rgba(13, 148, 136, 0.06); }
.term.node { --c: var(--slidev-theme-primary); --c-b: rgba(99, 102, 241, 0.3); --c-bg: rgba(99, 102, 241, 0.06); }
.term.arch { --c: #b45309; --c-b: rgba(245, 158, 11, 0.55); --c-bg: rgba(245, 158, 11, 0.12); }
.term.arch .v { font-size: 28px; }

.instant .reveal, .instant .lbl, .instant .term { transition: none !important; }
</style>
