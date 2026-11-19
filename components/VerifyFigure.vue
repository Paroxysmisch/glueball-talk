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
        <svg viewBox="0 0 250 150" class="bug" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="vf-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="rgba(225, 29, 72, 0.07)" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(225, 29, 72, 0.35)" stroke-width="2" />
            </pattern>
          </defs>
          <GlassRect :x="8" :y="10" :w="160" :h="30" :rx="7" tint="#6366f1" />
          <text x="88" y="29" class="bt">copy 0 → buffer 0</text>
          <GlassRect :x="40" :y="50" :w="170" :h="30" :rx="7" tint="#06b6d4" />
          <text x="125" y="69" class="bt">copy 1 → buffer 1</text>
          <GlassRect :x="76" :y="102" :w="110" :h="30" :rx="7" tint="#10b981" />
          <text x="131" y="121" class="bt">read buffer 0</text>
          <!-- the read overlaps copy 0 (same buffer); copy 1 writes a different buffer -->
          <rect x="76" y="8" width="92" height="34" rx="6" fill="url(#vf-hatch)" class="clash" />
          <rect x="76" y="100" width="92" height="34" rx="6" fill="url(#vf-hatch)" class="clash" />
          <line x1="68" x2="68" y1="96" y2="138" class="wait" />
          <text x="64" y="122" class="wait-t" text-anchor="end">wait</text>
          <line x1="6" x2="244" y1="146" y2="146" class="axis" />
        </svg>
        <div class="caption">The wait lets one copy too many stay in flight, so the read of buffer 0 can start while copy 0 is still writing it.</div>
      </div>

      <!-- ② the model -->
      <div class="col fade" :class="{ on: on(1) }">
        <div class="micro-label cap"><span class="n">2</span>The Z3 model</div>
        <div class="graph">
          <div class="ev lg indigo">Copy 0 finishes writing buffer 0</div>
          <div class="edge missing"><span class="line" /><span class="lab"><span class="x">✕</span> no “happens before” rule</span></div>
          <div class="ev lg slate">Wait <span class="sub">(up to 2 copies in flight)</span></div>
          <div class="edge"><span class="line" /><span class="lab">happens before</span></div>
          <div class="ev lg green">Read buffer 0</div>
        </div>
        <div class="query"><span class="z3">Z3</span> Can the read come before copy 0 finishes?</div>
      </div>

      <!-- ③ the counterexample -->
      <div class="col fade" :class="{ on: on(2) }">
        <div class="micro-label cap"><span class="n">3</span>Counterexample</div>
        <div class="stamp sat" :class="{ on: on(2) }"><span class="stamp-k">SAT</span><span class="stamp-v">yes, here is an ordering</span></div>
        <ol class="order">
          <li><span class="dot" />Copy 0 starts writing buffer 0</li>
          <li class="hit"><span class="dot" />Read buffer 0 <em class="during">mid-copy</em></li>
          <li><span class="dot" />Copy 0 finishes</li>
        </ol>
        <div class="caption">An ordering in logical time, which the agent replays on the real GPU to confirm the race.</div>
      </div>
    </div>

    <div class="fix fade" :class="{ on: on(3) }">
      <span class="micro-label">Fix</span>
      <span class="fix-t">Wait for one more copy, so the wait <em>happens after</em> copy 0 finishes.</span>
      <span class="stamp unsat" :class="{ on: on(3) }"><span class="stamp-k">UNSAT</span><span class="stamp-v">no such ordering → proof of no race</span></span>
    </div>
  </div>
</template>

<style scoped>
.vf { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
.cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 26px; }
.col { display: flex; flex-direction: column; gap: 10px; }
.cap { font-size: 10px !important; opacity: 0.75; display: flex; align-items: center; gap: 8px; }
.n { font-family: 'JetBrains Mono', monospace; color: var(--slidev-theme-primary); letter-spacing: 0; }
.caption { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12.5px; line-height: 1.4; color: var(--slidev-theme-ink-secondary); }

/* ① timing diagram */
.bug { width: 100%; height: auto; overflow: visible; }
.bt { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; text-anchor: middle; fill: var(--slidev-theme-ink); }
.clash { stroke: rgba(225, 29, 72, 0.6); stroke-width: 1.2; stroke-dasharray: 3 2; }
.clash-link { stroke: rgba(225, 29, 72, 0.55); stroke-width: 1.2; stroke-dasharray: 2 3; }
.wait { stroke: var(--slidev-theme-ink); stroke-width: 1.2; stroke-dasharray: 3 3; opacity: 0.7; }
.wait-t { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 13px; fill: var(--slidev-theme-ink); }
.axis { stroke: var(--slidev-theme-border); }

/* ② event graph */
.graph { display: flex; flex-direction: column; align-items: stretch; }
.ev { padding: 6px 12px; border-radius: 9px !important; font-family: 'Instrument Serif', serif; font-size: 17px; line-height: 1.15; color: var(--slidev-theme-ink); text-align: center; }
.ev .sub { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 11.5px; color: var(--slidev-theme-ink-secondary); }
.edge { position: relative; height: 26px; display: flex; align-items: center; justify-content: center; }
.edge .line { position: absolute; left: 50%; top: 2px; bottom: 2px; width: 0; border-left: 1.5px solid var(--slidev-theme-ink-secondary); }
.edge .line::after { content: ''; position: absolute; left: -5px; bottom: -2px; border-top: 6px solid var(--slidev-theme-ink-secondary); border-left: 4.5px solid transparent; border-right: 4.5px solid transparent; }
.edge .lab { position: absolute; left: calc(50% + 12px); top: 50%; transform: translateY(-50%); font-family: 'Instrument Serif', serif; font-style: italic; font-size: 14px; color: var(--slidev-theme-ink-secondary); white-space: nowrap; }
.edge.missing .line { border-left-style: dashed; border-color: rgba(225, 29, 72, 0.55); }
.edge.missing .line::after { display: none; }
.edge.missing .x { color: #e11d48; font-style: normal; margin-right: 2px; }
.query { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-family: 'Source Serif 4', serif; font-size: 12.5px; color: var(--slidev-theme-ink); }
.z3 { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 4px; background: var(--slidev-theme-ink); color: var(--slidev-theme-bg); }

/* ③ ordering in logical time */
.order { list-style: none; margin: 0; padding: 0 0 0 4px; position: relative; display: flex; flex-direction: column; gap: 10px; font-family: 'Source Serif 4', serif; font-size: 13.5px; color: var(--slidev-theme-ink); counter-reset: t; }
.order::before { content: ''; position: absolute; left: 8.5px; top: 8px; bottom: 8px; border-left: 1.5px solid var(--slidev-theme-border); }
.order li { display: flex; align-items: center; gap: 12px; counter-increment: t; }
.order li::after { content: 't' counter(t); order: -1; display: none; }
.dot { position: relative; z-index: 1; width: 10px; height: 10px; border-radius: 50%; background: var(--slidev-theme-bg); border: 2px solid var(--slidev-theme-primary); flex: none; }
.order li .during { font-family: 'Instrument Serif', serif; font-size: 15px; color: #e11d48; margin-left: 2px; }
.order li.hit .dot { border-color: #e11d48; background: #e11d48; }

/* stamps */
.stamp { display: inline-flex; align-items: baseline; gap: 10px; align-self: flex-start; padding: 4px 12px; border: 2.5px solid; border-radius: 9px; opacity: 0; transform: scale(1.7) rotate(-8deg); transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s; }
.stamp.on { opacity: 1; transform: scale(1) rotate(-2deg); }
.stamp-k { font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 20px; letter-spacing: 0.08em; }
.stamp-v { font-family: 'Source Serif 4', serif; font-size: 12.5px; color: var(--slidev-theme-ink); }
.sat { border-color: #e11d48; color: #e11d48; background: rgba(225, 29, 72, 0.06); }
.unsat { border-color: #10b981; color: #059669; background: rgba(16, 185, 129, 0.07); }

/* fix strip */
.fix { display: flex; align-items: center; gap: 16px; padding-top: 12px; border-top: 1px solid var(--slidev-theme-border); }
.fix .micro-label { font-size: 10px; opacity: 0.75; }
.fix-t { flex: 1; font-family: 'Source Serif 4', serif; font-size: 14px; color: var(--slidev-theme-ink); }
.fix-t em { color: var(--slidev-theme-primary); }

.fade { opacity: 0; transform: translateY(8px); transition: all 0.5s ease; }
.fade.on { opacity: 1; transform: none; }
</style>
