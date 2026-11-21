<script setup lang="ts">
/**
 * Slide 8 — the Gluon-to-Z3 hardware model on the pipelining bug from the paper (Fig. 5).
 * Like slide 7, each line of code and the event it becomes in the Z3 model share a colour.
 * step 0: the code
 * step 1: lines light up one by one; their events appear in the model, then the missing ordering + Z3's question
 * step 2: Z3's counterexample (SAT), *played* along a logical-time axis; each event flashes its code line
 * step 3: the fix: wait_group(2) → wait_group(1); copy 0 now happens before the wait; Z3: UNSAT
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAutoplay } from '../utils/autoplay'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const on = (n: number) => props.step >= n
const { instant } = useAutoplay()

// code lines; `e` = the model event a line maps to (shared colour)
const code = [
  { t: 'cp.async_copy(smem[0], src[0])', c: '# copy 0 into buf 0', e: 'c0', i: 0 },
  { t: 'cp.commit_group()', c: '', e: '', i: -1 },
  { t: 'for i in range(n):', c: '', e: '', i: -1 },
  { t: '    cp.async_copy(smem[(i+1) % 2], src[i+1])', c: '# copy 1 into buf 1', e: 'c1', i: 1 },
  { t: '    cp.commit_group()', c: '', e: '', i: -1 },
  { t: '    cp.wait_group(', c: '', e: 'w', i: 2, wait: true },
  { t: '    perform_add(smem[i % 2])', c: '# read buf 0', e: 'r', i: 3 },
]
const STEP_MS = 420
const d = (i: number) => ({ transitionDelay: on(1) && !on(2) ? `${i * STEP_MS}ms` : '0ms' })

// ---- counterexample playback (logical time t1..t4) ----
const tick = ref(0)
let timers: ReturnType<typeof setTimeout>[] = []
const clear = () => { timers.forEach(clearTimeout); timers = [] }
watch(() => [props.step, instant.value] as const, ([s, inst]) => {
  clear()
  if (s < 2) { tick.value = 0; return }
  if (inst || s >= 3) { tick.value = 4; return }
  tick.value = 0
  for (let k = 1; k <= 4; k++) timers.push(setTimeout(() => (tick.value = k), 350 + (k - 1) * 750))
}, { immediate: true })
onBeforeUnmount(clear)
// which code lines flash at each tick of the playback
const flashAt: Record<number, string[]> = { 1: ['c0', 'c1'], 2: ['w'], 3: ['r'], 4: ['c0'] }
const flashing = (e: string) => on(2) && !on(3) && !!e && (flashAt[tick.value] ?? []).includes(e)
const fixed = computed(() => on(3))

// timeline geometry
const TX = [96, 230, 364, 498]
</script>

<template>
  <div class="vf" :class="{ instant }">
    <div class="top">
      <div class="left">
        <!-- the code -->
        <div class="code glass">
          <div class="micro-label cap">The code</div>
          <div
            v-for="(l, k) in code" :key="k" class="cl"
            :class="[l.e, { lit: on(1) && l.e, flash: flashing(l.e) }]" :style="l.e ? d(l.i) : {}"
          >
            <span class="src">{{ l.t }}<template v-if="l.wait"><span class="arg" :class="{ 'is-fixed': fixed }">{{ fixed ? '1' : '2' }}</span>)</template></span>
            <span v-if="l.wait" class="cm">{{ fixed ? '# ≤ 1 copy in flight' : '# ≤ 2 copies in flight' }}</span>
            <span v-else-if="l.c" class="cm">{{ l.c }}</span>
          </div>
        </div>
        <!-- counterexample, played in logical time -->
        <svg viewBox="0 0 560 74" class="cex fade" :class="{ on: on(2), faded: fixed }" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="vf-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="rgba(225, 29, 72, 0.07)" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(225, 29, 72, 0.35)" stroke-width="2" />
            </pattern>
          </defs>
          <text x="0" y="15" class="lane">copy 0</text>
          <text x="0" y="45" class="lane">consumer</text>
          <!-- copy 0 is in flight from t1 until it finishes at t4 -->
          <rect x="76" y="4" :width="tick >= 1 ? (tick >= 4 ? TX[3] - 76 + 20 : TX[Math.min(tick, 3) - 1] - 76 + 60) : 0" height="18" rx="5" class="copy-span" />
          <text v-if="tick >= 4" :x="TX[3] + 26" y="17" class="evt">done</text>
          <!-- consumer events -->
          <g class="pop" :class="{ on: tick >= 2 }"><rect :x="TX[1] - 26" y="34" width="52" height="18" rx="5" class="wait-box" /><text :x="TX[1]" y="47" class="evt" text-anchor="middle">wait</text></g>
          <g class="pop" :class="{ on: tick >= 3 }"><rect :x="TX[2] - 40" y="34" width="80" height="18" rx="5" class="read-box" /><text :x="TX[2]" y="47" class="evt" text-anchor="middle">read buf 0</text></g>
          <!-- the race: the read happens while copy 0 is still in flight -->
          <g class="pop" :class="{ on: tick >= 3 }">
            <rect :x="TX[2] - 40" y="2" width="80" height="22" rx="5" fill="url(#vf-hatch)" class="clash" />
            <rect :x="TX[2] - 40" y="32" width="80" height="22" rx="5" fill="url(#vf-hatch)" class="clash" />
            <text :x="TX[2] + 48" y="31" class="race-t">race</text>
          </g>
          <!-- logical time axis + playhead -->
          <line x1="70" x2="556" y1="62" y2="62" class="axis" />
          <g v-for="(x, k) in TX" :key="k">
            <line :x1="x" :x2="x" y1="59" y2="65" class="axis" />
            <text :x="x" y="73" class="tk" text-anchor="middle">t{{ k + 1 }}</text>
          </g>
          <line v-if="tick >= 1" :x1="TX[Math.min(tick, 4) - 1]" :x2="TX[Math.min(tick, 4) - 1]" y1="0" y2="62" class="playhead" />
        </svg>
      </div>

      <!-- the model: the same events, with the ordering rules Z3 knows -->
      <div class="model-col">
        <div class="micro-label cap fade" :class="{ on: on(1) }">The Z3 model</div>
        <svg viewBox="0 0 300 168" class="model" xmlns="http://www.w3.org/2000/svg">
          <g class="ev fade" :class="{ on: on(1), flash: flashing('c0') }" :style="d(0)">
            <GlassRect :x="2" :y="2" :w="140" :h="28" :rx="8" tint="#6366f1" />
            <text x="72" y="21" class="ev-t">Copy 0 done</text>
          </g>
          <g class="ev fade" :class="{ on: on(1), flash: flashing('c1') }" :style="d(1)">
            <GlassRect :x="158" :y="2" :w="140" :h="28" :rx="8" tint="#06b6d4" />
            <text x="228" y="21" class="ev-t">Copy 1 done</text>
          </g>
          <!-- orderings into the wait: missing (bug) / present (fix) -->
          <g class="fade" :class="{ on: on(1) }" :style="d(4)">
            <path :d="fixed ? 'M 80 32 L 121 63' : 'M 80 32 L 122 64'" :class="fixed ? 'hb' : 'missing'" />
            <path v-if="fixed" d="M 111.9 61.8 L 121 63 L 117.3 54.6" class="hb" />
            <path d="M 220 32 L 178 64" class="missing" :class="{ dim: fixed }" />
            <text v-if="!fixed" x="150" y="52" class="miss-t">not ordered</text>
            <text v-else x="89" y="50" class="hb-t" text-anchor="end">happens before</text>
          </g>
          <g class="ev fade" :class="{ on: on(1), flash: flashing('w') }" :style="d(2)">
            <GlassRect :x="55" :y="66" :w="190" :h="28" :rx="8" tint="#64748b" />
            <text x="150" y="85" class="ev-t">Wait <tspan class="ev-sub">({{ fixed ? '≤ 1 copy' : '≤ 2 copies' }} in flight)</tspan></text>
          </g>
          <g class="fade" :class="{ on: on(1) }" :style="d(3)">
            <path d="M 150 96 V 128" class="hb" />
            <path d="M 145.5 122 L 150 130 L 154.5 122" class="hb" />
            <text x="160" y="117" class="hb-t">happens before</text>
          </g>
          <g class="ev fade" :class="{ on: on(1), flash: flashing('r') }" :style="d(3)">
            <GlassRect :x="55" :y="132" :w="190" :h="28" :rx="8" tint="#10b981" />
            <text x="150" y="151" class="ev-t">Read buffer 0</text>
          </g>
        </svg>
        <div class="query fade" :class="{ on: on(1) }" :style="d(5)"><span class="z3">Z3</span> Can the read come before copy 0 is done?</div>
        <div class="stamps">
          <div class="stamp sat" :class="{ on: on(2) && !fixed, gone: fixed }"><span class="stamp-k">SAT</span><span class="stamp-v">yes: replayed on the GPU</span></div>
          <div class="stamp unsat" :class="{ on: fixed }"><span class="stamp-k">UNSAT</span><span class="stamp-v">no such ordering, so no race</span></div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.vf { display: flex; flex-direction: column; gap: 10px; margin-top: -2px; }
.top { display: grid; grid-template-columns: max-content 1fr; gap: 28px; align-items: start; }
.cap { font-size: 10px !important; opacity: 0.7; margin-bottom: 8px; }

/* code (same look as slide 7's IR panel) */
.code { padding: 0.8em 1em !important; width: max-content; overflow: visible !important; }
.cl { font-family: var(--mono); font-size: 10.2px; line-height: 2; color: var(--slidev-theme-ink-secondary); border-radius: 4px; padding: 0 6px; white-space: pre; display: flex; gap: 14px; justify-content: space-between; transition: background 0.4s ease, color 0.4s ease, box-shadow 0.25s ease; }
.cl .cm { color: var(--slidev-theme-ink-secondary); opacity: 0.75; }
.cl.lit { color: var(--slidev-theme-ink); }
.c0.lit { background: rgba(99, 102, 241, 0.14); }
.c1.lit { background: rgba(6, 182, 212, 0.16); }
.w.lit { background: rgba(100, 116, 139, 0.16); }
.r.lit { background: rgba(16, 185, 129, 0.16); }
.cl.flash { box-shadow: 0 0 0 1.5px var(--slidev-theme-accent); }
.arg { border-radius: 3px; transition: background 0.4s ease, color 0.4s ease; }
.arg.is-fixed { background: rgba(16, 185, 129, 0.3); color: #047857; font-weight: 700; }

/* model */
.model-col { display: flex; flex-direction: column; }
.model { width: 100%; max-width: 330px; height: auto; overflow: visible; }
.ev-t { font-family: 'Instrument Serif', serif; font-size: 15px; text-anchor: middle; fill: var(--slidev-theme-ink); }
.ev-sub { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 10.5px; fill: var(--slidev-theme-ink-secondary); }
.ev { transition: opacity 0.5s ease, transform 0.5s ease, filter 0.25s ease; }
.ev.flash { filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.9)); }
.missing { fill: none; stroke: rgba(225, 29, 72, 0.6); stroke-width: 1.4; stroke-dasharray: 3 3; transition: opacity 0.4s; }
.missing.dim { opacity: 0.35; }
.miss-t { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 13px; text-anchor: middle; fill: #e11d48; }
.hb { fill: none; stroke: var(--slidev-theme-ink-secondary); stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.hb-t { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 13px; fill: var(--slidev-theme-ink-secondary); }
.query { display: flex; align-items: center; gap: 8px; margin-top: 6px; font-family: 'Source Serif 4', serif; font-size: 12.5px; color: var(--slidev-theme-ink); }
.z3 { font-family: var(--mono); font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 4px; background: var(--slidev-theme-ink); color: var(--slidev-theme-bg); }

/* bottom: stamps + counterexample playback */
.left { display: flex; flex-direction: column; gap: 10px; }
.stamps { position: relative; height: 40px; margin-top: 12px; }
.stamp { position: absolute; left: 0; top: 2px; display: inline-flex; align-items: baseline; gap: 10px; padding: 2px 12px; border: 2.5px solid; border-radius: 9px; opacity: 0; transform: scale(1.7) rotate(-8deg); transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s; white-space: nowrap; }
.stamp.on { opacity: 1; transform: scale(1) rotate(-2deg); }
.stamp.gone { opacity: 0; transform: scale(0.9); transition-delay: 0s; }
.stamp-k { font-family: var(--mono); font-weight: 800; font-size: 18px; letter-spacing: 0.08em; }
.stamp-v { font-family: 'Source Serif 4', serif; font-size: 12px; color: var(--slidev-theme-ink); }
.sat { border-color: #e11d48; color: #e11d48; background: rgba(225, 29, 72, 0.06); }
.unsat { border-color: #10b981; color: #059669; background: rgba(16, 185, 129, 0.07); }

.cex { width: 100%; height: auto; overflow: visible; }
.cex.faded { opacity: 0.25; }
.lane { font-family: 'Archivo', sans-serif; font-size: 8px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; fill: var(--slidev-theme-ink-secondary); }
.copy-span { fill: rgba(99, 102, 241, 0.16); stroke: #6366f1; stroke-width: 1.1; transition: width 0.6s ease; }
.wait-box { fill: rgba(100, 116, 139, 0.12); stroke: #64748b; stroke-width: 1.1; }
.read-box { fill: rgba(16, 185, 129, 0.14); stroke: #10b981; stroke-width: 1.1; }
.evt { font-family: var(--mono); font-size: 9.5px; fill: var(--slidev-theme-ink); }
.clash { stroke: rgba(225, 29, 72, 0.6); stroke-width: 1.2; stroke-dasharray: 3 2; }
.race-t { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 14px; fill: #e11d48; }
.axis { stroke: var(--slidev-theme-ink-secondary); stroke-width: 1; opacity: 0.5; }
.tk { font-family: var(--mono); font-size: 8.5px; fill: var(--slidev-theme-ink-secondary); }
.playhead { stroke: var(--slidev-theme-accent); stroke-width: 1.6; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.pop { opacity: 0; transition: opacity 0.35s ease; }
.pop.on { opacity: 1; }

.fade { opacity: 0; transform: translateY(6px); transition: opacity 0.45s ease, transform 0.45s ease; }
.fade.on { opacity: 1; transform: none; }
.cex.fade.on.faded { opacity: 0.25; }
.instant .fade, .instant .pop, .instant .stamp, .instant .copy-span, .instant .playhead, .instant .cl { transition: none !important; }
</style>
