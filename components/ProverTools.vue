<script setup lang="ts">
/**
 * Slide 5 — Glueball's two theorem-proving tools, each previewing the slide that explains it:
 *  · symbolic execution (code → maths), slide 7
 *  · asynchronous hardware model (hardware → events), slide 8
 * Autoplays: the cards rise in one after the other when the slide appears.
 */
import { useAutoplay } from '../utils/autoplay'

const { on, instant } = useAutoplay(250)
</script>

<template>
  <div class="pt" :class="{ instant }">
    <div class="z3-hub fade" :class="{ on }">
      <span class="z3">Z3</span><span class="hub-t">theorem prover, used by the agent as a tool</span>
    </div>

    <div class="cards">
      <div class="card lg indigo fade" :class="{ on }" style="--d: 0.25s">
        <div class="head"><span class="n">1</span><span class="micro-label">Symbolic execution</span></div>
        <div class="t">Code becomes maths</div>
        <div class="mini sym">
          <div class="ir">
            <div>%shifted = subf %row, %max</div>
            <div>%num = exp %shifted</div>
            <div>%out = divf %num, %den</div>
          </div>
          <span class="arrow"><Arr :w="1.6" /></span>
          <span class="frac"><span>exp(x − max)</span><span class="bar" /><span>Σ exp(x − max)</span></span>
        </div>
        <div class="cap">Does the kernel compute the right values?</div>
      </div>

      <div class="card lg cyan fade" :class="{ on }" style="--d: 0.65s">
        <div class="head"><span class="n">2</span><span class="micro-label">Asynchronous hardware model</span></div>
        <div class="t">Hardware operations become events</div>
        <div class="mini hw">
          <span class="ev lg indigo">Copy</span><span class="hb"><Arr /></span>
          <span class="ev lg slate">Barrier</span><span class="hb"><Arr /></span>
          <span class="ev lg green">Read</span>
        </div>
        <div class="cap">Are copies, barriers and memory accesses safely ordered?</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pt { display: flex; flex-direction: column; align-items: center; gap: 18px; margin-top: 30px; }
.z3-hub { display: flex; align-items: center; gap: 10px; }
.z3 { font-family: var(--mono); font-weight: 700; font-size: 13px; padding: 3px 9px; border-radius: 5px; background: var(--slidev-theme-ink); color: var(--slidev-theme-bg); }
.hub-t { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 14px; color: var(--slidev-theme-ink-secondary); }

.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; width: 830px; }
.card { padding: 16px 20px !important; display: flex; flex-direction: column; gap: 8px; text-align: left; }
.head { display: flex; align-items: center; gap: 8px; }
.head .micro-label { font-size: 10px !important; opacity: 0.7; }
.n { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--slidev-theme-primary); }
.t { font-family: 'Instrument Serif', serif; font-size: 26px; white-space: nowrap; line-height: 1.1; color: var(--slidev-theme-ink); }
.cap { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 13.5px; color: var(--slidev-theme-ink-secondary); }

.mini { height: 74px; display: flex; align-items: center; gap: 10px; }
.ir { font-family: var(--mono); font-size: 9.5px; line-height: 1.75; color: var(--slidev-theme-ink-secondary); white-space: nowrap; }
.arrow { font-size: 20px; color: var(--slidev-theme-primary); }
.frac { display: inline-flex; flex-direction: column; align-items: center; font-family: 'Instrument Serif', serif; font-size: 19px; color: var(--slidev-theme-ink); white-space: nowrap; }
.frac .bar { align-self: stretch; height: 1.2px; background: var(--slidev-theme-ink); margin: 2px 0; }

.hw { justify-content: center; }
.ev { padding: 8px 14px; border-radius: 10px !important; font-family: 'Instrument Serif', serif; font-size: 19px; color: var(--slidev-theme-ink); }
.hb { color: var(--slidev-theme-ink-secondary); font-size: 18px; }

.fade { opacity: 0; transform: translateY(14px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transition-delay: var(--d, 0s); }
.fade.on { opacity: 1; transform: none; }
.instant .fade { transition: none !important; }
</style>
