<script setup lang="ts">
/**
 * Slide 10 — best-agent median end-to-end speedup over Triton
 * (figures/speedups.json in the poster repo; Fig. 3 in the paper).
 * The axis runs 0.8×–1.8×; neighbourhood attention breaks the axis.
 */
import { onMounted, ref } from 'vue'

const rows = [
  { group: 'Whole models' },
  { name: 'GPT-OSS', v: 1.067, l: '1.07', note: 'transpose folded into TMA descriptor; GQA in-kernel' },
  { name: 'Qwen-3.5 MoE', v: 1.075, l: '1.08', note: 'expert routing via TMA gather' },
  { name: 'Mamba-2', v: 1.0, l: '1.00', note: "Triton's schedule is already strong", par: true },
  { group: 'Standalone kernels' },
  { name: 'Cross-Entropy', v: 1.669, l: '1.67', note: 'less host-side launch overhead' },
  { name: 'Llama-4 RoPE', v: 1.073, l: '1.07', note: 'bandwidth-bound: little headroom' },
  { name: 'Neighborhood Attn.', v: 24.85, l: '≈24', note: 'new algorithm: O(L²D) → O(LWD)', broken: true },
] as const

const MIN = 0.8, MAX = 1.8
const pct = (v: number) => (Math.min(v, MAX) - MIN) / (MAX - MIN) * 100
const one = pct(1)
const grown = ref(false)
onMounted(() => setTimeout(() => (grown.value = true), 250))
</script>

<template>
  <div class="sb" :class="{ grown }">
    <template v-for="(r, i) in rows" :key="i">
      <div v-if="'group' in r" class="group micro-label">{{ r.group }}</div>
      <div v-else class="row">
        <div class="name">{{ r.name }}</div>
        <div class="track">
          <div class="one" :style="{ left: `${one}%` }" />
          <div
            class="bar" :class="{ par: 'par' in r, broken: 'broken' in r }"
            :style="{ '--w': `${pct(r.v)}%`, transitionDelay: `${i * 70}ms` }"
          />
          <div class="val" :class="{ big: 'broken' in r }" :style="{ left: `calc(${'broken' in r ? 100 : pct(r.v)}% + 8px)` }">
            {{ r.l }}×
          </div>
        </div>
        <div class="note">{{ r.note }}</div>
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
.row { display: grid; grid-template-columns: 150px 1fr 230px; align-items: center; gap: 14px; height: 30px; }
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
  background: linear-gradient(90deg, rgba(var(--slidev-theme-secondary-rgb), 0.4), var(--slidev-theme-secondary));
  -webkit-mask: linear-gradient(90deg, #000 78%, transparent 78%, transparent 80.5%, #000 80.5%);
  mask: linear-gradient(90deg, #000 78%, transparent 78%, transparent 80.5%, #000 80.5%);
}
.val { position: absolute; top: 50%; transform: translateY(-50%); font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; color: var(--slidev-theme-ink); white-space: nowrap; opacity: 0; transition: opacity 0.4s ease 0.9s; }
.grown .val { opacity: 1; }
.val.low { color: #e11d48; }
.val.big { left: auto !important; right: 10px; font-family: 'Instrument Serif', serif; font-size: 26px; font-weight: 400; color: white; }
.note { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12.5px; line-height: 1.25; color: var(--slidev-theme-ink-secondary); }
.axis { height: 18px; }
.ticks span { position: absolute; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--slidev-theme-ink-secondary); }
</style>
