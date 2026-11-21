<script setup lang="ts">
/**
 * Slide 2 — the wider problem.
 * Left: notable AI models trained with >10^27 FLOP, cumulative, Epoch AI median projection
 *       (values decoded from the "counts-over-time-cumulative" chart of
 *        https://epoch.ai/publications/model-counts-compute-thresholds; the same decoding reproduces the
 *        article's quoted 10^26 figures: ~34 by 2027, ~239 by 2030).
 * Right: performance per watt needed by 2030 (stacked on a log scale): process-node gains (TSMC roadmap) at the
 *   bottom, architecture & software on top. See the constants below for sources and assumptions.
 * Animates in when the slide appears.
 */
import { useAutoplay } from '../utils/autoplay'

const { on, instant } = useAutoplay(250)

const models = [
  { y: '2026', v: 0 },
  { y: '2027', v: 6 },
  { y: '2028', v: 25 },
  { y: '2029', v: 64 },
  { y: '2030', v: 124 },
]
const MAXM = 140

// ---- right: performance per watt needed, and where it can come from (stacked, log scale) ----
// Needed: AI compute keeps growing 2.25x/yr (AI 2027 compute forecast, global AI compute stock; extended past 2027)
// while data-centre power grows only ~2.3x by 2030 (IEA, Energy and AI) => perf/W must grow 2.25 / 2.3^(1/6) ~ 1.96x/yr.
// Process node: cumulative perf/W from TSMC's leading node each year vs N3E, using the published power reduction at the
// same speed (the generous reading): N2 2025 (-25..30%), A16 2027 (-15..20% vs N2P), A14 2028 (-25..30% vs N2),
// A12 2029 (figures not disclosed; assumed like A14 vs N2). Nothing announced for 2030. Matches TSMC's "30% every two years".
const Y0 = 2024, Y1 = 2030
const needAt = (t: number) => (2.25 / 2.3 ** (1 / 6)) ** (t - Y0)
const NODES = [
  { y: 2024, f: 1, n: '' },
  { y: 2025, f: 1.38, n: 'N2' },
  { y: 2027, f: 1.67, n: 'A16' },
  { y: 2028, f: 1.9, n: 'A14' },
  { y: 2029, f: 2.3, n: 'A12' },
]
const nodeAt = (t: number) => NODES.filter(n => n.y <= t + 1e-9).at(-1)!.f
const W = 470, H = 176, PX = 34, PR = 382, PT = 10, PB = 150
const sx = (t: number) => PX + ((t - Y0) / (Y1 - Y0)) * (PR - PX)
const sy = (v: number) => PB - (Math.log10(v) / 2) * (PB - PT) // 1x .. 100x
const ts = Array.from({ length: 61 }, (_, i) => Y0 + (i / 60) * (Y1 - Y0))
// node band: stepped (a node arrives in its production year)
const nodePts: [number, number][] = [[Y0, 1]]
for (let i = 1; i < NODES.length; i++) nodePts.push([NODES[i].y, NODES[i - 1].f], [NODES[i].y, NODES[i].f])
nodePts.push([Y1, NODES.at(-1)!.f])
const nodeTop = nodePts.map(([t, v]) => `${sx(t).toFixed(1)},${sy(v).toFixed(1)}`)
const nodeArea = `M${sx(Y0)},${sy(1)} L${nodeTop.join(' L')} L${sx(Y1)},${sy(1)} Z`
const nodeLine = `M${nodeTop.join(' L')}`
// architecture & software band: from the node boundary up to the "needed" curve
const needTop = ts.map(t => `${sx(t).toFixed(1)},${sy(needAt(t)).toFixed(1)}`)
const archArea = `M${needTop.join(' L')} L${nodeTop.slice().reverse().join(' L')} Z`
const needLine = `M${needTop.join(' L')}`
const NEED = needAt(Y1), NODE = nodeAt(Y1), ARCH = NEED / NODE
</script>

<template>
  <div class="cg" :class="{ on, instant }">
    <!-- left: models above 10^27 FLOP -->
    <div class="panel">
      <div class="head">
        <span class="t">Models trained with &gt;10<sup>27</sup> FLOP</span>
        <span class="s">cumulative, by the start of each year · Epoch AI median projection</span>
      </div>
      <div class="bars">
        <div v-for="(m, i) in models" :key="m.y" class="col">
          <span class="v" :style="{ '--d': `${0.25 + i * 0.12 + 0.7}s` }">{{ m.v }}</span>
          <div class="bar" :style="{ '--h': `${(m.v / MAXM) * 100}%`, '--d': `${0.25 + i * 0.12}s` }" />
          <span class="yr">{{ m.y }}</span>
        </div>
      </div>
    </div>

    <!-- right: perf/W needed, split into process node vs architecture & software -->
    <div class="panel">
      <div class="head">
        <span class="t">Performance per watt needed</span>
        <span class="s">relative to 2024, log scale · stacked by source of the gain</span>
      </div>
      <svg :viewBox="`0 0 ${W} ${H}`" class="area" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="cg-reveal"><rect class="reveal" :x="PX - 2" y="0" :width="PR - PX + 4" :height="H" /></clipPath>
          <linearGradient id="cg-arch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--slidev-theme-accent)" stop-opacity="0.55" />
            <stop offset="100%" stop-color="var(--slidev-theme-accent)" stop-opacity="0.22" />
          </linearGradient>
          <linearGradient id="cg-node" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--slidev-theme-primary)" stop-opacity="0.45" />
            <stop offset="100%" stop-color="var(--slidev-theme-primary)" stop-opacity="0.18" />
          </linearGradient>
        </defs>
        <!-- grid + axes -->
        <line v-for="v in [1, 10, 100]" :key="'g' + v" :x1="PX" :x2="PR" :y1="sy(v)" :y2="sy(v)" class="grid" />
        <text v-for="v in [1, 10, 100]" :key="'t' + v" :x="PX - 6" :y="sy(v) + 3" class="tick" text-anchor="end">{{ v }}×</text>
        <text v-for="y in [2024, 2026, 2028, 2030]" :key="y" :x="sx(y)" :y="PB + 15" class="tick" text-anchor="middle">{{ y }}</text>
        <!-- stacked areas, revealed left to right -->
        <g clip-path="url(#cg-reveal)">
          <path :d="archArea" fill="url(#cg-arch)" />
          <path :d="nodeArea" fill="url(#cg-node)" />
          <path :d="nodeLine" class="node-line" />
          <path :d="needLine" class="need-line" />
          <g v-for="n in NODES.slice(1)" :key="n.n">
            <circle :cx="sx(n.y)" :cy="sy(n.f)" r="2.6" class="node-dot" />
            <text :x="sx(n.y) + 3" :y="sy(n.f) - 5" class="node-n">{{ n.n }}</text>
          </g>
        </g>
        <line :x1="PX" :x2="PR" :y1="PB" :y2="PB" class="axis" />
        <!-- end labels -->
        <g class="lbl">
          <text :x="PR + 8" :y="sy(NEED) + 4" class="l-need"><tspan class="l-v">×{{ Math.round(NEED) }}</tspan> needed</text>
          <text :x="PR + 8" :y="(sy(NEED) + sy(NODE)) / 2 + 2" class="l-arch"><tspan class="l-v">×{{ Math.round(ARCH) }}</tspan> architecture</text>
          <text :x="PR + 8" :y="(sy(NEED) + sy(NODE)) / 2 + 15" class="l-arch">&amp; software</text>
          <text :x="PR + 8" :y="(sy(NODE) + sy(1)) / 2 + 4" class="l-node"><tspan class="l-v">×{{ NODE.toFixed(1) }}</tspan> process node</text>
        </g>
      </svg>
      <div class="note">Assumes AI compute keeps growing ~2.25× a year while data-centre power only ~doubles by 2030. Node gains use TSMC's published power savings at the same speed.</div>
    </div>

  </div>
</template>

<style scoped>
.cg { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 14px 44px; margin-top: 2px; }
.head { display: flex; flex-direction: column; margin-bottom: 10px; }
.head .t { font-family: 'Instrument Serif', serif; font-size: 24px; line-height: 1.1; color: var(--slidev-theme-ink); }
.head .s { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12px; color: var(--slidev-theme-ink-secondary); }

/* left: vertical bars */
.bars { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; height: 150px; align-items: end; border-bottom: 1px solid var(--slidev-theme-ink); padding: 0 6px; }
.col { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; }
.bar { width: 70%; height: 0; border-radius: 6px 6px 0 0; background: linear-gradient(180deg, var(--slidev-theme-secondary), var(--slidev-theme-primary)); box-shadow: 0 6px 14px -8px rgba(var(--slidev-theme-primary-rgb), 0.8); transition: height 0.9s cubic-bezier(0.4, 0, 0.2, 1); transition-delay: var(--d); }
.on .bar { height: var(--h); }
.v { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--slidev-theme-ink); margin-bottom: 4px; opacity: 0; transition: opacity 0.3s ease; transition-delay: var(--d); }
.on .v { opacity: 1; }
.yr { position: absolute; bottom: -20px; font-family: var(--mono); font-size: 11px; color: var(--slidev-theme-ink-secondary); }

/* right: log-scale horizontal bars */

.area { width: 100%; height: auto; overflow: visible; }
.grid { stroke: var(--slidev-theme-border); }
.axis { stroke: var(--slidev-theme-ink); opacity: 0.5; }
.tick { font-family: var(--mono); font-size: 9px; fill: var(--slidev-theme-ink-secondary); }
.reveal { transform: scaleX(0); transform-origin: left; transform-box: fill-box; transition: transform 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s; }
.on .reveal { transform: scaleX(1); }
.node-line { fill: none; stroke: var(--slidev-theme-primary); stroke-width: 1.6; }
.need-line { fill: none; stroke: #b45309; stroke-width: 2.2; }
.node-dot { fill: var(--slidev-theme-primary); }
.node-n { font-family: var(--mono); font-size: 8.5px; font-weight: 700; fill: var(--slidev-theme-primary); }
.lbl { opacity: 0; transition: opacity 0.5s ease 2.2s; }
.on .lbl { opacity: 1; }
.l-v { font-family: var(--mono); font-weight: 700; font-size: 12px; }
.l-need, .l-arch, .l-node { font-family: 'Source Serif 4', serif; font-size: 11px; }
.l-need { fill: #b45309; }
.l-arch { fill: #b45309; }
.l-node { fill: var(--slidev-theme-primary); }
.note { margin-top: 6px; font-family: 'Source Serif 4', serif; font-style: italic; font-size: 11.5px; line-height: 1.4; color: var(--slidev-theme-ink-secondary); opacity: 0; transition: opacity 0.5s ease 2.4s; }
.on .note { opacity: 1; }
.instant .bar, .instant .v, .instant .reveal, .instant .lbl, .instant .note { transition: none !important; }
</style>
