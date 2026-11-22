<script setup lang="ts">
/**
 * Ablation (poster, card 5): what do the two specialised tools buy?
 * Arms: both tools · Z3 library only · symbolic execution only · neither (raw model).
 * Average tokens to find the bug, full width; bars grow when the slide appears.
 */
import { useAutoplay } from '../utils/autoplay'

const arms = [
  { name: 'Both tools', tok: 0.93, k: 'both' },
  { name: 'Z3 library only', tok: 1.21, k: 'z3' },
  { name: 'Symbolic exec. only', tok: 1.40, k: 'sym' },
  { name: 'Neither (raw model)', tok: 1.52, k: 'none' },
]
const TOK_MAX = 1.8
// bars grow when the slide appears (not when it is pre-mounted), like slide 9
const { on: grown, instant } = useAutoplay(300)
</script>

<template>
  <div class="ab" :class="{ grown, instant }">
    <div class="micro-label cap">Average tokens to find the bug <span class="dir">lower is better</span></div>
    <div v-for="(a, i) in arms" :key="a.k" class="row">
      <div class="name">{{ a.name }}</div>
      <div class="track">
        <div class="bar" :class="a.k" :style="{ '--w': `${(a.tok / TOK_MAX) * 100}%`, transitionDelay: `${i * 80}ms` }" />
        <span class="val" :style="{ left: `calc(${(a.tok / TOK_MAX) * 100}% + 10px)` }">{{ a.tok.toFixed(2) }}M</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ab { margin-top: 36px; }
.cap { font-size: 12px !important; opacity: 0.7; margin-bottom: 18px; white-space: nowrap; }
.dir { margin-left: 8px; font-weight: 400; letter-spacing: 0.06em; text-transform: none; font-family: 'Source Serif 4', serif; font-style: italic; opacity: 0.8; }
.row { display: grid; grid-template-columns: 190px 1fr; align-items: center; gap: 16px; height: 70px; }
.name { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 17px; color: var(--slidev-theme-ink); }
.track { position: relative; height: 34px; margin-right: 70px; }
.bar { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 0 6px 6px 0; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
.grown .bar { width: var(--w); }
.val { opacity: 0; transition: opacity 0.3s ease 0.9s; }
.grown .val { opacity: 1; }
.instant .bar, .instant .val { transition: none !important; }
.bar.both { background: linear-gradient(90deg, rgba(16, 185, 129, 0.3), #10b981); }
.bar.z3 { background: linear-gradient(90deg, rgba(var(--slidev-theme-primary-rgb), 0.25), var(--slidev-theme-primary)); }
.bar.sym { background: linear-gradient(90deg, rgba(var(--slidev-theme-secondary-rgb), 0.25), var(--slidev-theme-secondary)); }
.bar.none { background: linear-gradient(90deg, rgba(225, 29, 72, 0.25), #e11d48); opacity: 0.8; }
.val { position: absolute; top: 50%; transform: translateY(-50%); font-family: var(--mono); font-weight: 700; font-size: 17px; color: var(--slidev-theme-ink); white-space: nowrap; }
</style>
