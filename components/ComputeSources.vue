<script setup lang="ts">
/**
 * Slide 4 — where the 2030 compute must come from.
 * AI compute demand 2024 -> 2030, decomposed multiplicatively (so additively on a log scale):
 *   demand    = 2.25^(t-2024)  (AI 2027 compute forecast, global AI compute; extended past 2027) -> x130
 *   power     = AI-focused data-centre electricity (IEA, Apr 2026: +50% in 2025, tripling 2025 -> 2030) -> x4.5
 *   node      = TSMC perf/W at the leading node vs N3E (N2 2025, A16 2027, A14 2028, A12 2029 assumed like A14) -> x2.3
 *   architecture & software = the remainder -> x13
 * One SVG: the stacked chart on the left; each band's 2030 end is joined by a connector to its card on the right,
 * and the cards read top to bottom as the product  x130 = x13 × x2.3 × x4.5  (same order as the stack).
 * Animates in when the slide appears (~1.5 s): chart sweeps in, then connectors and cards.
 */
import { useAutoplay } from '../utils/autoplay'

const { on, instant } = useAutoplay(150)

const W = 780, H = 256
const PX = 36, PR = 440, PT = 16, PB = 226
const Y0 = 2024, Y1 = 2030
const demandAt = (t: number) => 2.25 ** (t - Y0)
const powerAt = (t: number) => (t <= 2025 ? 1.5 ** (t - Y0) : 1.5 * 3 ** ((t - 2025) / 5))
const NODES = [
  { y: 2024, f: 1 },
  { y: 2025, f: 1.38 },
  { y: 2027, f: 1.67 },
  { y: 2028, f: 1.9 },
  { y: 2029, f: 2.3 },
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

// ---- cards (right column), top to bottom in stack order ----
const CX = 520, CW = 252
const HEAD_Y = 30 // baseline of the "×130 demand" header
const cards = [
  { k: 'arch', v: `×${Math.round(ARCH)}`, n: 'architecture & software', s: 'everything else', y: 48, h: 62, band: [DEM, POW * NODE] },
  { k: 'node', v: `×${NODE.toFixed(1)}`, n: 'process node', s: 'TSMC roadmap, N3E → A12', y: 130, h: 44, band: [POW * NODE, POW] },
  { k: 'pow', v: `×${POW.toFixed(1)}`, n: 'more power', s: 'AI data-centre electricity, IEA', y: 194, h: 44, band: [POW, 1] },
].map(c => {
  const by = (sy(c.band[0]) + sy(c.band[1])) / 2 // middle of the band at 2030
  const cy = c.y + c.h / 2
  const x0 = PR + 6, x1 = CX - 6, mx = (x0 + x1) / 2
  return { ...c, by, cy, path: `M${x0},${by.toFixed(1)} C${mx},${by.toFixed(1)} ${mx},${cy} ${x1},${cy}` }
})
const OPS = [{ y: (cards[0].y + cards[0].h + cards[1].y) / 2 + 5 }, { y: (cards[1].y + cards[1].h + cards[2].y) / 2 + 5 }]
const demY = sy(DEM)
const demPath = `M${PR + 6},${demY.toFixed(1)} C${(PR + CX) / 2},${demY.toFixed(1)} ${(PR + CX) / 2},${HEAD_Y - 5} ${CX - 6},${HEAD_Y - 5}`
</script>

<template>
  <div class="cs" :class="{ on, instant }">
    <div class="head">
      <span class="t">AI compute demand by 2030, and where it must come from</span>
      <span class="s">relative to 2024, log scale · stacked by source</span>
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

      <!-- chart -->
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

      <!-- connectors from the 2030 end of each band to its card -->
      <g class="links">
        <path :d="demPath" class="link dem" />
        <circle :cx="PR" :cy="demY" r="3.2" class="dot dem" />
        <g v-for="c in cards" :key="'l' + c.k">
          <path :d="c.path" class="link" :class="c.k" />
          <circle :cx="PR" :cy="c.by" r="3.2" class="dot" :class="c.k" />
        </g>
      </g>

      <!-- header: total demand -->
      <g class="card-g" style="--d: 1s">
        <text :x="CX" :y="HEAD_Y" class="dem-v">×{{ Math.round(DEM) }}</text>
        <text :x="CX + 72" :y="HEAD_Y" class="dem-n">compute demand =</text>
      </g>

      <!-- cards, read as a product -->
      <g v-for="(c, i) in cards" :key="c.k" class="card-g" :style="{ '--d': `${1.1 + i * 0.12}s` }">
        <rect :x="CX" :y="c.y" :width="CW" :height="c.h" rx="9" class="card" :class="c.k" />
        <text :x="CX + 14" :y="c.cy + (c.k === 'arch' ? 9 : 7)" class="c-v" :class="c.k">{{ c.v }}</text>
        <text :x="CX + (c.k === 'arch' ? 92 : 76)" :y="c.cy - 2" class="c-n">{{ c.n }}</text>
        <text :x="CX + (c.k === 'arch' ? 92 : 76)" :y="c.cy + 13" class="c-s">{{ c.s }}</text>
      </g>
      <text v-for="(o, i) in OPS" :key="'op' + i" :x="CX + 14" :y="o.y" class="op card-g" :style="{ '--d': `${1.15 + i * 0.12}s` }">×</text>
    </svg>
  </div>
</template>

<style scoped>
.cs { margin-top: 2px; }
.head { display: flex; flex-direction: column; margin-bottom: 8px; white-space: nowrap; }
.head .t { font-family: 'Instrument Serif', serif; font-size: 24px; line-height: 1.1; color: var(--slidev-theme-ink); }
.head .s { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12px; color: var(--slidev-theme-ink-secondary); }

.area { width: 100%; height: auto; overflow: visible; }
.gridline { stroke: var(--slidev-theme-border); }
.axis { stroke: var(--slidev-theme-ink); opacity: 0.5; }
.tick { font-family: var(--mono); font-size: 9px; fill: var(--slidev-theme-ink-secondary); }
.reveal { transform: scaleX(0); transform-origin: left; transform-box: fill-box; transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1) 0.15s; }
.on .reveal { transform: scaleX(1); }
.power-line { fill: none; stroke: #0d9488; stroke-width: 1.6; }
.node-line { fill: none; stroke: var(--slidev-theme-primary); stroke-width: 1.6; }
.demand-line { fill: none; stroke: var(--slidev-theme-ink); stroke-width: 2.2; }

/* connectors */
.links { opacity: 0; transition: opacity 0.4s ease 0.9s; }
.on .links { opacity: 1; }
.link { fill: none; stroke-width: 1.4; stroke-dasharray: 3 3; }
.link.dem, .dot.dem { stroke: var(--slidev-theme-ink); fill: var(--slidev-theme-ink); }
.link.dem { fill: none; }
.link.arch { stroke: #d97706; }
.link.node { stroke: var(--slidev-theme-primary); }
.link.pow { stroke: #0d9488; }
.dot.arch { fill: #d97706; }
.dot.node { fill: var(--slidev-theme-primary); }
.dot.pow { fill: #0d9488; }

/* header + cards */
.card-g { opacity: 0; transform: translateX(6px); transition: opacity 0.35s ease, transform 0.35s ease; transition-delay: var(--d); }
.on .card-g { opacity: 1; transform: none; }
.dem-v { font-family: var(--mono); font-weight: 700; font-size: 24px; fill: var(--slidev-theme-ink); }
.dem-n { font-family: 'Source Serif 4', serif; font-size: 13px; fill: var(--slidev-theme-ink-secondary); }
.card { stroke-width: 1; }
.card.arch { fill: rgba(245, 158, 11, 0.13); stroke: rgba(245, 158, 11, 0.6); }
.card.node { fill: rgba(99, 102, 241, 0.07); stroke: rgba(99, 102, 241, 0.35); }
.card.pow { fill: rgba(13, 148, 136, 0.07); stroke: rgba(13, 148, 136, 0.35); }
.c-v { font-family: var(--mono); font-weight: 700; font-size: 20px; }
.c-v.arch { font-size: 30px; fill: #b45309; }
.c-v.node { fill: var(--slidev-theme-primary); }
.c-v.pow { fill: #0d9488; }
.c-n { font-family: 'Source Serif 4', serif; font-size: 13px; fill: var(--slidev-theme-ink); }
.c-s { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 10px; fill: var(--slidev-theme-ink-secondary); }
.op { font-family: var(--mono); font-size: 14px; fill: var(--slidev-theme-ink-secondary); }

.instant .reveal, .instant .links, .instant .card-g { transition: none !important; }
</style>
