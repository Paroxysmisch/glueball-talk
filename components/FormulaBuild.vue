<script setup lang="ts">
/**
 * Slide 7 — symbolic execution: the softmax kernel's TTIR (paper, Appendix C.1) becomes one formula.
 * step 0: the IR · 1: lines light up one by one while the formula assembles
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const on = (n: number) => props.step >= n

// each IR line and the piece of the formula it produces share a colour + an order index
const ir = [
  { v: '%row', op: 'tt.load %input_ptrs', c: 'c1', i: 0 },
  { v: '%row_max', op: 'tt.reduce(max) %row', c: 'c2', i: 1 },
  { v: '%shifted', op: 'arith.subf %row, %row_max', c: 'c3', i: 2 },
  { v: '%numerator', op: 'math.exp %shifted', c: 'c4', i: 3 },
  { v: '%denominator', op: 'tt.reduce(sum) %numerator', c: 'c5', i: 4 },
  { v: '%out', op: 'arith.divf %numerator, %denominator', c: 'c6', i: 5 },
]
const STEP_MS = 380
const d = (i: number) => ({ transitionDelay: on(1) ? `${i * STEP_MS}ms` : '0ms' })
</script>

<template>
  <div class="fb">
    <div class="cols">
      <!-- IR -->
      <div class="ir glass">
        <div class="micro-label cap">Softmax kernel · Triton IR (one row)</div>
        <div v-for="l in ir" :key="l.v" class="ir-line" :class="[l.c, { lit: on(1) }]" :style="d(l.i)">
          <span class="ssa">{{ l.v }}</span><span class="eq">=</span><span class="op">{{ l.op }}</span>
        </div>
        <div class="ir-line store"><span class="op">tt.store %output_ptrs, %out</span></div>
      </div>

      <div class="arrow" :class="{ on: on(1) }">→<span>Z3</span></div>

      <!-- formula -->
      <div class="formula">
        <div class="micro-label cap">One formula for the whole kernel</div>
        <div class="math">
          <span class="lhs">out<sub>i</sub></span><span class="eqs">=</span>
          <span class="frac">
            <span class="num">
              <span class="piece c4" :class="{ on: on(1) }" :style="d(3)">exp(</span>
              <span class="piece c1" :class="{ on: on(1) }" :style="d(0)">row<sub>i</sub></span>
              <span class="piece c3" :class="{ on: on(1) }" :style="d(2)">&nbsp;−&nbsp;</span>
              <span class="piece c2" :class="{ on: on(1) }" :style="d(1)">row_max</span>
              <span class="piece c4" :class="{ on: on(1) }" :style="d(3)">)</span>
            </span>
            <span class="bar piece c6" :class="{ on: on(1) }" :style="d(5)" />
            <span class="den piece" :class="{ on: on(1) }" :style="d(4)">
              <span class="c5 sum">Σ<sub>j</sub></span>
              <span class="c4">exp(</span><span class="c1">row<sub>j</sub></span><span class="c3">&nbsp;−&nbsp;</span><span class="c2">row_max</span><span class="c4">)</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fb { display: flex; flex-direction: column; gap: 18px; margin-top: 36px; }
.cols { display: grid; grid-template-columns: 1.05fr 60px 1fr; align-items: center; gap: 10px; }
.cap { font-size: 10px !important; opacity: 0.6; margin-bottom: 10px; }

.ir { padding: 0.9em 1.1em !important; }
.ir-line { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; line-height: 2; color: var(--slidev-theme-ink-secondary); border-radius: 4px; padding: 0 6px; transition: background 0.4s ease, color 0.4s ease; white-space: nowrap; }
.ssa { display: inline-block; min-width: 92px; color: var(--slidev-theme-ink); }
.eq { margin: 0 8px; opacity: 0.5; }
.ir-line.store { opacity: 0.5; }

.arrow { font-size: 28px; text-align: center; color: var(--slidev-theme-ink-secondary); opacity: 0.25; transition: opacity 0.5s; display: flex; flex-direction: column; align-items: center; }
.arrow span { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; }
.arrow.on { opacity: 1; }

.math { display: flex; align-items: center; gap: 10px; font-family: 'Instrument Serif', serif; font-size: 32px; color: var(--slidev-theme-ink); }
.math.small { font-size: 20px; }
.lhs { font-style: italic; }
.eqs { opacity: 0.6; }
.frac { display: inline-flex; flex-direction: column; align-items: center; }
.num, .den { padding: 0 6px; white-space: nowrap; }
.bar { display: block; align-self: stretch; height: 1.5px; background: var(--slidev-theme-ink); margin: 3px 0; }
.piece { opacity: 0.08; transition: opacity 0.4s ease, color 0.4s ease, background 0.4s ease; border-radius: 4px; }
.piece.on { opacity: 1; }


/* colour pairs: IR line ↔ formula piece */
.c1.lit, .c1.piece.on { background: rgba(99, 102, 241, 0.14); }
.c2.lit, .c2.piece.on { background: rgba(6, 182, 212, 0.16); }
.c3.lit, .c3.piece.on { background: rgba(225, 29, 72, 0.12); }
.c4.lit, .c4.piece.on { background: rgba(245, 158, 11, 0.18); }
.c5.lit, .c5.piece.on { background: rgba(16, 185, 129, 0.16); }
.c6.lit { background: rgba(26, 26, 46, 0.08); }
.bar.c6.on { background: var(--slidev-theme-ink); }
.den > span { border-radius: 4px; }
.den .c1 { background: rgba(99, 102, 241, 0.14); }
.den .c2 { background: rgba(6, 182, 212, 0.16); }
.den .c3 { background: rgba(225, 29, 72, 0.12); }
.den .c4 { background: rgba(245, 158, 11, 0.18); }
.den .c5 { background: rgba(16, 185, 129, 0.2); padding: 0 4px; margin-right: 4px; }
.ir-line.lit { color: var(--slidev-theme-ink); }

</style>
