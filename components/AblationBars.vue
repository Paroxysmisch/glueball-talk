<script setup lang="ts">
/**
 * Ablation (poster, card 5): what do the two specialised tools buy?
 * Arms: both tools · Z3 library only · symbolic execution only · neither (raw model).
 * step 0: average tokens to find the bug · 1: false positives on bug-free code
 */
import { useAutoplay } from '../utils/autoplay'
const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })

const arms = [
  { name: 'Both tools', found: 28, tok: 0.93, fp: 0, k: 'both' },
  { name: 'Z3 library only', found: 28, tok: 1.21, fp: 0, k: 'z3' },
  { name: 'Symbolic exec. only', found: 27, tok: 1.40, fp: 0, k: 'sym' },
  { name: 'Neither (raw model)', found: 27, tok: 1.52, fp: 7, k: 'none' },
]
const TOK_MAX = 2.0
const FP_MAX = 8
// bars grow when the slide appears (not when it is pre-mounted), like slide 9
const { on: grown, instant } = useAutoplay(300)
</script>

<template>
  <div class="ab" :class="{ grown, instant }">
    <div class="panel">
      <div class="micro-label cap">Average tokens to find the bug <span class="dir">lower is better</span></div>
      <div v-for="(a, i) in arms" :key="a.k" class="row">
        <div class="name">{{ a.name }}</div>
        <div class="track">
          <div class="bar" :class="a.k" :style="{ '--w': `${(a.tok / TOK_MAX) * 100}%`, transitionDelay: `${i * 80}ms` }" />
          <span class="val" :style="{ left: `calc(${(a.tok / TOK_MAX) * 100}% + 8px)` }">{{ a.tok.toFixed(2) }}M</span>
        </div>
      </div>
    </div>

    <div class="panel fade" :class="{ on: props.step >= 1 }">
      <div class="micro-label cap">False positives · 21 bug-free kernels <span class="dir">lower is better</span></div>
      <div v-for="(a, i) in arms" :key="a.k" class="row short">
        <div class="name">{{ a.name }}</div>
        <div class="track">
          <div v-if="a.fp" class="bar none" :style="{ '--w': `${(a.fp / FP_MAX) * 100}%`, transitionDelay: `${300 + i * 80}ms` }" />
          <span class="val" :class="{ zero: !a.fp }" :style="{ left: a.fp ? `calc(${(a.fp / FP_MAX) * 100}% + 8px)` : '0' }">{{ a.fp }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ab { display: grid; grid-template-columns: 1fr 1fr; gap: 44px; margin-top: 40px; }
.cap { font-size: 10px !important; opacity: 0.7; margin-bottom: 14px; white-space: nowrap; }
.dir { margin-left: 8px; font-weight: 400; letter-spacing: 0.06em; text-transform: none; font-family: 'Source Serif 4', serif; font-style: italic; opacity: 0.8; }
.row { display: grid; grid-template-columns: 140px 1fr; align-items: center; gap: 12px; height: 50px; }
.row.short { grid-template-columns: 140px 1fr; }
.name { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 13px; color: var(--slidev-theme-ink); }
.track { position: relative; height: 22px; }
.bar { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 0 4px 4px 0; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
.grown .bar, .fade.on .bar { width: var(--w); }
.val { opacity: 0; transition: opacity 0.3s ease 0.9s; }
.grown .val { opacity: 1; }
.instant .bar, .instant .val, .instant.fade { transition: none !important; }
.bar.both { background: linear-gradient(90deg, rgba(16, 185, 129, 0.3), #10b981); }
.bar.z3 { background: linear-gradient(90deg, rgba(var(--slidev-theme-primary-rgb), 0.25), var(--slidev-theme-primary)); }
.bar.sym { background: linear-gradient(90deg, rgba(var(--slidev-theme-secondary-rgb), 0.25), var(--slidev-theme-secondary)); }
.bar.none { background: linear-gradient(90deg, rgba(225, 29, 72, 0.25), #e11d48); opacity: 0.8; }
.val { position: absolute; top: 50%; transform: translateY(-50%); font-family: var(--mono); font-weight: 700; font-size: 13px; color: var(--slidev-theme-ink); white-space: nowrap; }
.val.zero { color: #059669; }
.fade { opacity: 0; transform: translateY(8px); transition: all 0.5s ease; }
.fade.on { opacity: 1; transform: none; }
</style>
