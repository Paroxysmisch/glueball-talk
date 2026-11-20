<script setup lang="ts">
/**
 * Slide 2 — the wider problem.
 * Left: notable AI models trained with >10^27 FLOP, cumulative, Epoch AI median projection
 *       (values decoded from the "counts-over-time-cumulative" chart of
 *        https://epoch.ai/publications/model-counts-compute-thresholds; the same decoding reproduces the
 *        article's quoted 10^26 figures: ~34 by 2027, ~239 by 2030).
 * Right: AI 2027 compute forecast (Section 1): global AI compute vs AI datacentre power, 2023 -> 2027,
 *   normalised to 2023 (log scale): compute x25, power x12, so compute per watt only ~x2.
 *   Plus TSMC A14 vs N2: at most +15% speed at the same power (production 2028).
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

// AI 2027 compute forecast, Section 1 table (end of year): global AI compute stock in H100-equivalents and
// total AI datacentre power. Normalised to 2023 = 1x. https://ai-2027.com/research/compute-forecast
const YEARS = ['2023', '2024', '2025', '2026', '2027']
const H100E = [4, 8.5, 18, 40, 100] // millions
const GW = [5, 9, 15, 29, 62]
const series = [
  { k: 'compute', t: 'AI compute', v: H100E.map(x => x / H100E[0]) },
  { k: 'power', t: 'AI datacentre power (62 GW)', v: GW.map(x => x / GW[0]) },
  { k: 'eff', t: 'compute per watt', v: H100E.map((x, i) => (x / H100E[0]) / (GW[i] / GW[0])) },
]
const LW = 470, LH = 100, LX = 30, LY = 8 // plot box inside the SVG
const xs = (i: number) => LX + (i / (YEARS.length - 1)) * (LW - LX - 190)
const ys = (v: number) => LY + LH - (Math.log10(v) / Math.log10(30)) * LH
const pathOf = (v: number[]) => v.map((y, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(y).toFixed(1)}`).join(' ')
const endLabel = (v: number[]) => `×${v[v.length - 1] >= 10 ? Math.round(v[v.length - 1]) : v[v.length - 1].toFixed(1)}`
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

    <!-- right: AI 2027 forecast: growth is being bought with power -->
    <div class="panel">
      <div class="head">
        <span class="t">Growth is being bought with power</span>
        <span class="s">AI 2027 forecast, relative to 2023 · log scale</span>
      </div>
      <svg :viewBox="`0 0 ${LW} ${LY + LH + 22}`" class="lines" xmlns="http://www.w3.org/2000/svg">
        <line v-for="t in [1, 10]" :key="'g' + t" :x1="LX" :x2="xs(4)" :y1="ys(t)" :y2="ys(t)" class="grid" />
        <text v-for="t in [1, 10]" :key="'t' + t" :x="LX - 6" :y="ys(t) + 3" class="tick" text-anchor="end">{{ t }}×</text>
        <text v-for="(y, i) in YEARS" :key="y" :x="xs(i)" :y="LY + LH + 16" class="tick" text-anchor="middle">{{ y }}</text>
        <line :x1="LX" :x2="xs(4)" :y1="LY + LH" :y2="LY + LH" class="axis" />
        <g v-for="(sr, i) in series" :key="sr.k" :class="['series', sr.k]">
          <path :d="pathOf(sr.v)" pathLength="1" class="ln" :style="{ '--d': `${0.5 + i * 0.35}s` }" />
          <circle :cx="xs(4)" :cy="ys(sr.v[4])" r="3.2" class="dot" :style="{ '--d': `${1.4 + i * 0.35}s` }" />
          <text :x="xs(4) + 8" :y="ys(sr.v[4]) + 4" class="end" :style="{ '--d': `${1.4 + i * 0.35}s` }"><tspan class="end-v">{{ endLabel(sr.v) }}</tspan> {{ sr.t }}</text>
        </g>
      </svg>
      <div class="note">Process nodes won't close the gap: TSMC's A14 (2028) is at most <span class="nk">15%</span> faster than N2 at the same power.</div>
    </div>

    <div class="punch">…and every new architectural feature makes the software harder: FlashAttention went from 35% to 75% of H100 peak only ~2 years after Hopper launched.</div>
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

.lines { width: 100%; height: auto; overflow: visible; }
.grid { stroke: var(--slidev-theme-border); }
.axis { stroke: var(--slidev-theme-ink); opacity: 0.5; }
.tick { font-family: var(--mono); font-size: 9px; fill: var(--slidev-theme-ink-secondary); }
.ln { fill: none; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.1s cubic-bezier(0.4, 0, 0.2, 1); transition-delay: var(--d); }
.on .ln { stroke-dashoffset: 0; }
.dot, .end { opacity: 0; transition: opacity 0.35s ease; transition-delay: var(--d); }
.on .dot, .on .end { opacity: 1; }
.end { font-family: 'Source Serif 4', serif; font-size: 11px; fill: var(--slidev-theme-ink-secondary); }
.end-v { font-family: var(--mono); font-weight: 700; font-size: 12px; fill: var(--slidev-theme-ink); }
.compute .ln { stroke: var(--slidev-theme-primary); } .compute .dot { fill: var(--slidev-theme-primary); }
.power .ln { stroke: #94a3b8; } .power .dot { fill: #94a3b8; }
.eff .ln { stroke: var(--slidev-theme-accent); stroke-width: 3; } .eff .dot { fill: var(--slidev-theme-accent); }
.eff .end, .eff .end-v { fill: #b45309; }
.note { margin-top: 6px; font-family: 'Source Serif 4', serif; font-size: 12.5px; line-height: 1.4; color: var(--slidev-theme-ink-secondary); opacity: 0; transition: opacity 0.5s ease 2s; }
.on .note { opacity: 1; }
.nk { font-family: var(--mono); font-weight: 700; color: var(--slidev-theme-ink); }
.punch { grid-column: 1 / -1; margin-top: 18px; font-family: 'Instrument Serif', serif; font-style: italic; font-size: 19px; line-height: 1.25; color: var(--slidev-theme-ink); opacity: 0; transition: opacity 0.6s ease 2.2s; }
.on .punch { opacity: 1; }
.instant .bar, .instant .v, .instant .ln, .instant .dot, .instant .end, .instant .note, .instant .punch { transition: none !important; }
</style>
