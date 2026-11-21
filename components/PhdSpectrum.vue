<script setup lang="ts">
/**
 * PhD slide — from the first-year report ("Automating Machine Learning Systems Development"):
 * three directions along the software → hardware spectrum, towards automated co-design.
 * step 0: kernels (Glueball + next) · 1: compilers + hardware
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const on = (n: number) => props.step >= n

const dirs = [
  {
    n: '1', area: 'Kernels', t: 'Agentic kernel optimisation & verification',
    now: 'Glueball', next: 'Inequivalence checking: adversarial agents hunt for inputs where two kernels disagree; only mismatches reproduced on real hardware count.',
    at: 0,
  },
  {
    n: '2', area: 'Compilers', t: 'Agent-built compilers for new accelerators',
    next: 'Agents learn a new accelerator (PLENA) from its docs and their own experiments, then build its XLA and Triton backends.',
    at: 1,
  },
  {
    n: '3', area: 'Hardware', t: 'AI-accelerated performance modelling',
    next: 'One learned model predicting time, power and area for any design–workload pair, from RTL instead of slow simulation.',
    at: 1,
  },
]
</script>

<template>
  <div class="ps">
    <div class="axis">
      <span class="end-l">Software</span>
      <!-- double-headed arrow: heads and body are adjacent flex items, so they always meet -->
      <span class="arrow">
        <i class="head left" />
        <i class="body" />
        <i class="head right" />
      </span>
      <span class="end-r">Hardware</span>
    </div>

    <div class="cards">
      <div v-for="d in dirs" :key="d.n" class="card lg fade" :class="[{ on: on(d.at) }, d.n === '1' ? 'indigo' : 'slate']">
        <div class="head">
          <span class="n">{{ d.n }}</span>
          <span class="micro-label area">{{ d.area }}</span>
        </div>
        <div class="t">{{ d.t }}</div>
        <div v-if="d.now" class="now"><span class="tag">Year 1</span>{{ d.now }}</div>
        <div class="next">{{ d.next }}</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.ps { display: flex; flex-direction: column; gap: 12px; }
.arrow { flex: 1; display: flex; align-items: center; opacity: 0.75; }
.arrow .body { flex: 1; height: 2px; background: linear-gradient(90deg, var(--slidev-theme-primary), var(--slidev-theme-secondary)); }
.arrow .head { width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; }
.arrow .head.left { border-right: 9px solid var(--slidev-theme-primary); }
.arrow .head.right { border-left: 9px solid var(--slidev-theme-secondary); }
.axis { display: flex; align-items: center; gap: 12px; font-family: 'Archivo', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--slidev-theme-ink-secondary); }

.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card { padding: 12px 14px !important; display: flex; flex-direction: column; gap: 6px; }
.head { display: flex; align-items: center; gap: 8px; }
.n { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--slidev-theme-primary); }
.area { font-size: 10px !important; opacity: 0.6; }
.t { font-family: 'Instrument Serif', serif; font-size: 21px; line-height: 1.1; color: var(--slidev-theme-ink); }
.now { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 13px; color: var(--slidev-theme-primary); display: flex; align-items: center; gap: 8px; }
.tag { font-family: var(--mono); font-size: 9.5px; font-weight: 700; padding: 1px 6px; border-radius: 4px; background: rgba(var(--slidev-theme-primary-rgb), 0.12); }
.next { font-family: 'Source Serif 4', serif; font-size: 12.5px; line-height: 1.4; color: var(--slidev-theme-ink-secondary); }



.fade { opacity: 0; transform: translateY(8px); transition: all 0.5s ease; }
.fade.on { opacity: 1; transform: none; }
</style>
