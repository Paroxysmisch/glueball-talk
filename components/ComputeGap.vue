<script setup lang="ts">
/**
 * Slide 2 — the wider problem.
 * Left: notable AI models trained with >10^27 FLOP, cumulative, Epoch AI median projection
 *       (values decoded from the "counts-over-time-cumulative" chart of
 *        https://epoch.ai/publications/model-counts-compute-thresholds; the same decoding reproduces the
 *        article's quoted 10^26 figures: ~34 by 2027, ~239 by 2030).
 * Right: where ~100x more training compute per year by 2030 could come from (log scale):
 *   compute needed ~100x  (our estimate from Epoch's projections — see speaker notes)
 *   data-centre electricity ~2.3x (IEA Energy & AI 2025: 415 TWh in 2024 -> 945 TWh in 2030)
 *   process node <=1.15x at the same power (TSMC A14 vs N2, production 2028)
 *   left for architecture + software: 100 / (2.3 x 1.15) ~ 40x
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

const gap = [
  { k: 'need', t: 'Training compute needed / year', s: '2025 to 2030', v: 100, l: '~100×' },
  { k: 'power', t: 'Data-centre electricity', s: 'IEA, 2024 to 2030', v: 2.3, l: '~2.3×' },
  { k: 'node', t: 'Process node, same power', s: 'TSMC A14 vs N2', v: 1.15, l: '≤1.15×' },
  { k: 'rest', t: 'Left for architecture & software', s: '100 ÷ (2.3 × 1.15)', v: 38, l: '~40×' },
]
const logw = (v: number) => (Math.log10(v) / 2) * 100 // 1x → 0%, 100x → 100%
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

    <!-- right: where would ~100x come from? -->
    <div class="panel">
      <div class="head">
        <span class="t">Where would ~100× more compute come from?</span>
        <span class="s">growth factor to 2030, log scale</span>
      </div>
      <div class="gap">
        <div v-for="(g, i) in gap" :key="g.k" class="row" :class="g.k">
          <div class="lab"><span class="lt">{{ g.t }}</span><span class="ls">{{ g.s }}</span></div>
          <div class="track">
            <div class="gbar" :style="{ '--w': `${logw(g.v)}%`, '--d': `${0.6 + i * 0.25}s` }" />
            <span class="gv" :style="{ left: `calc(${logw(g.v)}% + 8px)`, '--d': `${0.6 + i * 0.25 + 0.7}s` }">{{ g.l }}</span>
          </div>
        </div>
        <div class="ticks"><span v-for="t in [1, 10, 100]" :key="t" :style="{ left: `${logw(t)}%` }">{{ t }}×</span></div>
      </div>
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
.gap { display: flex; flex-direction: column; gap: 6px; }
.row { display: grid; grid-template-columns: 196px 1fr; align-items: center; gap: 12px; height: 32px; }
.lab { display: flex; flex-direction: column; line-height: 1.2; }
.lt { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 12.5px; color: var(--slidev-theme-ink); }
.ls { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 11px; color: var(--slidev-theme-ink-secondary); }
.track { position: relative; height: 22px; border-left: 1px solid var(--slidev-theme-ink); }
.gbar { position: absolute; left: 0; top: 0; bottom: 0; width: 0; min-width: 0; border-radius: 0 5px 5px 0; transition: width 0.9s cubic-bezier(0.4, 0, 0.2, 1); transition-delay: var(--d); }
.on .gbar { width: max(var(--w), 3px); }
.need .gbar { background: linear-gradient(90deg, rgba(var(--slidev-theme-primary-rgb), 0.35), var(--slidev-theme-primary)); }
.power .gbar, .node .gbar { background: linear-gradient(90deg, rgba(100, 116, 139, 0.25), #94a3b8); }
.rest .gbar { background: repeating-linear-gradient(45deg, rgba(var(--slidev-theme-accent-rgb, 245, 158, 11), 0.55) 0 6px, rgba(245, 158, 11, 0.3) 6px 12px); border: 1.5px solid var(--slidev-theme-accent); }
.rest .lt { color: #b45309; }
.gv { position: absolute; top: 50%; transform: translateY(-50%); font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--slidev-theme-ink); white-space: nowrap; opacity: 0; transition: opacity 0.3s ease; transition-delay: var(--d); }
.rest .gv { color: #b45309; }
.on .gv { opacity: 1; }
.ticks { position: relative; height: 14px; margin-left: 208px; }
.ticks span { position: absolute; transform: translateX(-50%); font-family: var(--mono); font-size: 10px; color: var(--slidev-theme-ink-secondary); }

.punch { grid-column: 1 / -1; margin-top: 18px; font-family: 'Instrument Serif', serif; font-style: italic; font-size: 19px; line-height: 1.25; color: var(--slidev-theme-ink); opacity: 0; transition: opacity 0.6s ease 2.2s; }
.on .punch { opacity: 1; }
.instant .bar, .instant .v, .instant .gbar, .instant .gv, .instant .punch { transition: none !important; }
</style>
