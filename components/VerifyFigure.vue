<script setup lang="ts">
/**
 * Slide 8 — the Gluon-to-Z3 hardware model on a worked example (the pipelining bug from the paper, Fig. 5),
 * illustrated rather than shown as code.
 * step 0: ① the bug, as a timing diagram
 * step 1: ② the Z3 model: events + "happens before" rules, with the missing rule
 * step 2: ③ Z3's counterexample (SAT): an ordering in logical time where the read lands mid-copy
 * step 3: the fix: Z3 finds no such ordering (UNSAT) → proof of no race
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const on = (n: number) => props.step >= n
</script>

<template>
  <div class="vf">
    <div class="cols">
      <!-- ① the bug -->
      <div class="col">
        <div class="micro-label cap"><span class="n">1</span>The bug</div>
        <svg viewBox="0 0 260 128" class="bug" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="vf-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="rgba(225, 29, 72, 0.07)" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(225, 29, 72, 0.35)" stroke-width="2" />
            </pattern>
          </defs>
          <GlassRect :x="4" :y="4" :w="150" :h="28" :rx="7" tint="#6366f1" />
          <SvgArrowLabel :x="79" :y="21.5" left="copy 0" right="buf 0" :size="9.5" :gap="10" />
          <GlassRect :x="30" :y="38" :w="160" :h="28" :rx="7" tint="#06b6d4" />
          <SvgArrowLabel :x="110" :y="55.5" left="copy 1" right="buf 1" :size="9.5" :gap="10" />
          <GlassRect :x="40" :y="82" :w="50" :h="28" :rx="7" tint="#64748b" />
          <text x="65" y="99.5" class="bt">wait</text>
          <GlassRect :x="94" :y="82" :w="100" :h="28" :rx="7" tint="#10b981" />
          <text x="144" y="99.5" class="bt">read buf 0</text>
          <!-- the read overlaps copy 0 (same buffer) -->
          <rect x="94" y="2" width="62" height="32" rx="6" fill="url(#vf-hatch)" class="clash" />
          <rect x="94" y="80" width="62" height="32" rx="6" fill="url(#vf-hatch)" class="clash" />
          <line x1="0" x2="256" y1="124" y2="124" class="axis" />
          <text x="256" y="120" class="axis-t" text-anchor="end">time</text>
        </svg>
        <div class="caption">The wait blocks only while more than 2 copies are in flight, so it returns at once.</div>
      </div>

      <!-- ② the model: the same events, with the ordering rules Z3 knows -->
      <div class="col fade" :class="{ on: on(1) }">
        <div class="micro-label cap"><span class="n">2</span>The Z3 model</div>
        <svg viewBox="0 0 300 160" class="model" xmlns="http://www.w3.org/2000/svg">
          <GlassRect :x="2" :y="2" :w="140" :h="28" :rx="8" tint="#6366f1" />
          <text x="72" y="21" class="ev-t">Copy 0 done</text>
          <GlassRect :x="158" :y="2" :w="140" :h="28" :rx="8" tint="#06b6d4" />
          <text x="228" y="21" class="ev-t">Copy 1 done</text>
          <!-- no ordering from either copy to the wait -->
          <path d="M 80 32 L 122 62" class="missing" />
          <path d="M 220 32 L 178 62" class="missing" />
          <text x="150" y="51" class="miss-t">not ordered</text>
          <GlassRect :x="55" :y="64" :w="190" :h="28" :rx="8" tint="#64748b" />
          <text x="150" y="83" class="ev-t">Wait <tspan class="ev-sub">(≤ 2 copies in flight)</tspan></text>
          <!-- wait happens before the read -->
          <path d="M 150 94 V 124" class="hb" />
          <path d="M 145.5 118 L 150 126 L 154.5 118" class="hb" />
          <text x="160" y="114" class="hb-t">happens before</text>
          <GlassRect :x="55" :y="128" :w="190" :h="28" :rx="8" tint="#10b981" />
          <text x="150" y="147" class="ev-t">Read buffer 0</text>
        </svg>
        <div class="query"><span class="z3">Z3</span> Can the read come before copy 0 is done?</div>
      </div>

      <!-- ③ the counterexample -->
      <div class="col fade" :class="{ on: on(2) }">
        <div class="micro-label cap"><span class="n">3</span>Counterexample</div>
        <div class="stamp sat" :class="{ on: on(2) }"><span class="stamp-k">SAT</span><span class="stamp-v">yes, here is an ordering</span></div>
        <ol class="order">
          <li><span class="dot" />Copies 0 and 1 start</li>
          <li><span class="dot" />Wait returns: 2 in flight</li>
          <li class="hit"><span class="dot" />Read buffer 0 <em class="during">mid-copy</em></li>
          <li><span class="dot" />Copy 0 finishes</li>
        </ol>
        <div class="replay"><Arr />replayed on the GPU to confirm the race</div>
      </div>
    </div>

    <div class="fix fade" :class="{ on: on(3) }">
      <span class="micro-label">Fix</span>
      <span class="fix-t">Wait until ≤ 1 copy is in flight, so the wait <em>happens after</em> copy 0 is done.</span>
      <span class="stamp unsat" :class="{ on: on(3) }"><span class="stamp-k">UNSAT</span><span class="stamp-v">no such ordering, so no race</span></span>
    </div>
  </div>
</template>

<style scoped>
.vf { display: flex; flex-direction: column; gap: 10px; margin-top: -4px; }
.cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 26px; }
.col { display: flex; flex-direction: column; gap: 8px; }
.cap { font-size: 10px !important; opacity: 0.75; display: flex; align-items: center; gap: 8px; }
.n { font-family: var(--mono); color: var(--slidev-theme-primary); letter-spacing: 0; }
.replay { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12.5px; color: var(--slidev-theme-ink-secondary); }
.caption { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12px; line-height: 1.35; color: var(--slidev-theme-ink-secondary); }

/* ① timing diagram */
.bug { width: 100%; height: auto; overflow: visible; }
.bt { font-family: var(--mono); font-size: 9.5px; text-anchor: middle; fill: var(--slidev-theme-ink); }
.clash { stroke: rgba(225, 29, 72, 0.6); stroke-width: 1.2; stroke-dasharray: 3 2; }
.axis { stroke: var(--slidev-theme-border); }
.axis-t { font-family: var(--mono); font-size: 8.5px; fill: var(--slidev-theme-ink-secondary); }
.lane { font-family: 'Archivo', sans-serif; font-size: 8px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; fill: var(--slidev-theme-ink-secondary); }

/* ② model (SVG) */
.model { width: 100%; height: auto; overflow: visible; }
.ev-t { font-family: 'Instrument Serif', serif; font-size: 15px; text-anchor: middle; fill: var(--slidev-theme-ink); }
.ev-sub { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 10.5px; fill: var(--slidev-theme-ink-secondary); }
.missing { fill: none; stroke: rgba(225, 29, 72, 0.6); stroke-width: 1.4; stroke-dasharray: 3 3; }
.miss-t { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 13px; text-anchor: middle; fill: #e11d48; }
.hb { fill: none; stroke: var(--slidev-theme-ink-secondary); stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.hb-t { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 13px; fill: var(--slidev-theme-ink-secondary); }
.query { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-family: 'Source Serif 4', serif; font-size: 12.5px; color: var(--slidev-theme-ink); }
.z3 { font-family: var(--mono); font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 4px; background: var(--slidev-theme-ink); color: var(--slidev-theme-bg); }

/* ③ ordering in logical time */
.order { list-style: none; margin: 0; padding: 0 0 0 4px; position: relative; display: flex; flex-direction: column; gap: 6px; font-family: 'Source Serif 4', serif; font-size: 13.5px; color: var(--slidev-theme-ink); counter-reset: t; }
.order::before { content: ''; position: absolute; left: 8.5px; top: 8px; bottom: 8px; border-left: 1.5px solid var(--slidev-theme-border); }
.order li { display: flex; align-items: center; gap: 12px; counter-increment: t; }
.order li::after { content: 't' counter(t); order: -1; display: none; }
.dot { position: relative; z-index: 1; width: 10px; height: 10px; border-radius: 50%; background: var(--slidev-theme-bg); border: 2px solid var(--slidev-theme-primary); flex: none; }
.order li .during { font-family: 'Instrument Serif', serif; font-size: 15px; color: #e11d48; margin-left: 2px; }
.order li.hit .dot { border-color: #e11d48; background: #e11d48; }

/* stamps */
.stamp { display: inline-flex; align-items: baseline; gap: 10px; align-self: flex-start; padding: 2px 12px; border: 2.5px solid; border-radius: 9px; opacity: 0; transform: scale(1.7) rotate(-8deg); transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s; }
.stamp.on { opacity: 1; transform: scale(1) rotate(-2deg); }
.stamp-k { font-family: var(--mono); font-weight: 800; font-size: 18px; letter-spacing: 0.08em; }
.stamp-v { font-family: 'Source Serif 4', serif; font-size: 12.5px; color: var(--slidev-theme-ink); }
.sat { border-color: #e11d48; color: #e11d48; background: rgba(225, 29, 72, 0.06); }
.unsat { border-color: #10b981; color: #059669; background: rgba(16, 185, 129, 0.07); }

/* fix strip */
.fix { display: flex; align-items: center; gap: 16px; padding-top: 6px; border-top: 1px solid var(--slidev-theme-border); }
.fix .micro-label { font-size: 10px; opacity: 0.75; }
.fix-t { flex: 1; font-family: 'Source Serif 4', serif; font-size: 14px; color: var(--slidev-theme-ink); }
.fix-t em { color: var(--slidev-theme-primary); }

.fade { opacity: 0; transform: translateY(8px); transition: all 0.5s ease; }
.fade.on { opacity: 1; transform: none; }
</style>
