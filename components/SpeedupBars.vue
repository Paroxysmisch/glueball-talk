<script setup lang="ts">
/**
 * Slide 10 — best-agent median end-to-end speedup over Triton
 * (figures/speedups.json in the poster repo; Fig. 3 in the paper).
 * The axis runs 0.8×–1.8× over the first AXIS% of the track; neighbourhood attention (24.85×) is off-scale,
 * so its bar runs past the axis end with a break, and its label sits after it like every other label.
 * Bars grow when the slide appears.
 */
import { useAutoplay } from '../utils/autoplay'

const rows = [
  { group: 'Whole models' },
  { name: 'GPT-OSS', v: 1.067, l: '1.07', note: 'transpose folded into TMA descriptor' },
  { name: 'Qwen-3.5 MoE', v: 1.075, l: '1.08', note: 'expert routing via TMA gather' },
  { name: 'Mamba-2', v: 1.0, l: '1.00', note: "Triton's schedule is already strong", par: true },
  { group: 'Standalone kernels' },
  { name: 'Cross-Entropy', v: 1.669, l: '1.67', note: 'less host-side launch overhead' },
  { name: 'Llama-4 RoPE', v: 1.073, l: '1.07', note: 'one vector load per complex pair' },
  { name: 'Neighborhood Attn.', v: 24.85, l: '24.85', note: 'new algorithm: O(L²D) → O(LWD)', broken: true },
] as const

const MIN = 0.8, MAX = 1.8
const AXIS = 82 // % of the track used by the 0.8×–1.8× scale
const BROKEN = 88 // % of the track the off-scale bar runs to
const pct = (v: number) => ((Math.min(v, MAX) - MIN) / (MAX - MIN)) * AXIS
const width = (r: { v: number }) => ('broken' in r ? BROKEN : pct(r.v))
const one = pct(1)
const { on: grown, instant } = useAutoplay(250)
// the break sits just past the axis end, expressed in the bar's own coordinates
const gap0 = `${((AXIS + 1) / BROKEN) * 100}%`
const gap1 = `${((AXIS + 2.6) / BROKEN) * 100}%`
</script>

<template>
  <div class="sb" :class="{ grown, instant }" :style="{ '--g0': gap0, '--g1': gap1 }">
    <template v-for="(r, i) in rows" :key="i">
      <div v-if="'group' in r" class="group micro-label">{{ r.group }}</div>
      <div v-else class="row">
        <div class="name">{{ r.name }}</div>
        <div class="track">
          <div class="one" :style="{ left: `${one}%` }" />
          <div
            class="bar" :class="{ par: 'par' in r, broken: 'broken' in r }"
            :style="{ '--w': `${width(r)}%`, transitionDelay: `${i * 70}ms` }"
          />
          <div class="val" :style="{ left: `calc(${width(r)}% + 8px)` }">
            {{ r.l }}×
          </div>
        </div>
        <div class="note">
          <template v-for="(part, k) in r.note.split('→')" :key="k"><Arr v-if="k" />{{ part }}</template>
        </div>
      </div>
    </template>
    <div class="row axis">
      <div />
      <div class="track ticks">
        <span v-for="t in [0.8, 1.0, 1.2, 1.4, 1.6, 1.8]" :key="t" :style="{ left: `${pct(t)}%` }">{{ t.toFixed(1) }}×</span>
      </div>
      <div />
    </div>
  </div>
</template>

<style scoped>
.sb { display: flex; flex-direction: column; gap: 5px; }
.group { font-size: 10px !important; opacity: 0.55; margin-top: 6px; }
.row { display: grid; grid-template-columns: 145px 1fr 215px; align-items: center; gap: 14px; height: 30px; }
.name { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 14px; color: var(--slidev-theme-ink); }
.track { position: relative; height: 22px; }
.one { position: absolute; top: -6px; bottom: -6px; width: 1px; background: var(--slidev-theme-ink); opacity: 0.45; }
.bar {
  position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 0 4px 4px 0;
  background: linear-gradient(90deg, rgba(var(--slidev-theme-primary-rgb), 0.35), var(--slidev-theme-primary));
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.grown .bar { width: var(--w); }
.bar.par { background: linear-gradient(90deg, rgba(100, 116, 139, 0.2), #94a3b8); }
.bar.broken {
  -webkit-mask: linear-gradient(90deg, #000 var(--g0), transparent var(--g0), transparent var(--g1), #000 var(--g1));
  mask: linear-gradient(90deg, #000 var(--g0), transparent var(--g0), transparent var(--g1), #000 var(--g1));
}
.val { position: absolute; top: 50%; transform: translateY(-50%); font-family: var(--mono); font-weight: 700; font-size: 14px; color: var(--slidev-theme-ink); white-space: nowrap; opacity: 0; transition: opacity 0.4s ease 0.9s; }
.grown .val { opacity: 1; }
.instant .bar, .instant .val { transition: none !important; }
.note { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12.5px; line-height: 1.25; color: var(--slidev-theme-ink-secondary); }
.axis { height: 18px; }
.ticks span { position: absolute; transform: translateX(-50%); font-family: var(--mono); font-size: 10px; color: var(--slidev-theme-ink-secondary); }
</style>
