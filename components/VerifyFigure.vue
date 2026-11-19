<script setup lang="ts">
/**
 * Slide 8 — the Gluon-to-Z3 library, for a non-technical audience.
 * step 0: three events + "happens before" rules · 1: the question to Z3
 * 2: UNSAT stamp · 3: SAT stamp
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const on = (n: number) => props.step >= n

const events = [
  { t: 'Copy', s: 'writes buffer 0', k: 'copy' },
  { t: 'Barrier', s: 'copy has finished', k: 'bar' },
  { t: 'Read', s: 'reads buffer 0', k: 'read' },
]
</script>

<template>
  <div class="vf">
    <div class="events">
      <template v-for="(e, i) in events" :key="e.t">
        <div class="ev" :class="e.k">
          <div class="ev-t">{{ e.t }}</div>
          <div class="ev-s">{{ e.s }}</div>
        </div>
        <div v-if="i < events.length - 1" class="hb">
          <span class="hb-arrow">⟶</span>
          <span class="hb-lab">happens before</span>
        </div>
      </template>
    </div>

    <div class="query" :class="{ on: on(1) }">
      <span class="z3">Z3</span>
      <span>Find an ordering of events where the read can happen <em>before the copy has finished</em>.</span>
    </div>

    <div class="verdicts">
      <div class="stamp unsat" :class="{ on: on(2) }">
        <div class="stamp-k">UNSAT</div>
        <div class="stamp-v">No such ordering exists → <strong>proof</strong> of no race</div>
      </div>
      <div class="stamp sat" :class="{ on: on(3) }">
        <div class="stamp-k">SAT</div>
        <div class="stamp-v">Here is one → a concrete <strong>counterexample</strong>, replayed on the GPU</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vf { display: flex; flex-direction: column; gap: 24px; margin-top: 16px; }

.events { display: flex; align-items: center; justify-content: center; gap: 10px; }
.ev { width: 200px; padding: 14px 16px; border-radius: 10px; border: 1.5px solid; text-align: center; }
.ev.copy { border-color: #6366f1; background: rgba(99, 102, 241, 0.1); }
.ev.bar { border-color: #64748b; background: rgba(100, 116, 139, 0.08); }
.ev.read { border-color: #10b981; background: rgba(16, 185, 129, 0.12); }
.ev-t { font-family: 'Instrument Serif', serif; font-size: 28px; line-height: 1.1; color: var(--slidev-theme-ink); }
.ev-s { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 13.5px; color: var(--slidev-theme-ink-secondary); }
.hb { display: flex; flex-direction: column; align-items: center; color: var(--slidev-theme-ink-secondary); }
.hb-arrow { font-size: 26px; line-height: 1; }
.hb-lab { font-family: 'Archivo', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }

.query { align-self: center; display: flex; align-items: center; gap: 14px; padding: 10px 18px; border: 1px dashed var(--slidev-theme-border); border-radius: 10px; font-family: 'Source Serif 4', serif; font-size: 16px; color: var(--slidev-theme-ink); opacity: 0; transform: translateY(8px); transition: all 0.5s ease; }
.query.on { opacity: 1; transform: none; }
.z3 { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; padding: 3px 9px; border-radius: 5px; background: var(--slidev-theme-ink); color: var(--slidev-theme-bg); }
.query em { color: #e11d48; }

.verdicts { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; padding: 0 30px; }
.stamp { padding: 10px 16px; border: 2.5px solid; border-radius: 10px; opacity: 0; transform: scale(1.8) rotate(-8deg); transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
.stamp.on { opacity: 1; transform: scale(1) rotate(-2deg); }
.stamp-k { font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 26px; letter-spacing: 0.08em; }
.stamp-v { font-family: 'Source Serif 4', serif; font-size: 14.5px; color: var(--slidev-theme-ink); }
.unsat { border-color: #10b981; color: #059669; background: rgba(16, 185, 129, 0.07); }
.sat { border-color: #e11d48; color: #e11d48; background: rgba(225, 29, 72, 0.06); }
.sat.on { transform: scale(1) rotate(2deg); }
</style>
