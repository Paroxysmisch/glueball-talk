<script setup lang="ts">
/** Slide 3 — two-state agent loop: Write ⇄ Feedback, orbiting an LLM agent. */
const R = 120
const C = 160
const pos = (a: number) => ({ x: C + R * Math.cos((a * Math.PI) / 180), y: C + R * Math.sin((a * Math.PI) / 180) })
const nodes = [
  { label: 'Write', sub: 'kernel variant', angle: -90, tint: 'indigo' },
  { label: 'Feedback', sub: 'profiling · correctness', angle: 90, tint: 'cyan' },
]
// right arc: Write → Feedback (clockwise); left arc: Feedback → Write
const arc = (a0: number, a1: number) => {
  const p0 = pos(a0), p1 = pos(a1)
  return `M ${p0.x} ${p0.y} A ${R} ${R} 0 0 1 ${p1.x} ${p1.y}`
}
// the same clearance G at both ends of both arcs → the two arcs mirror each other about the vertical axis,
// and G is large enough that neither arc (nor its arrowhead) touches a node box
const G = 56
const arcs = [arc(-90 + G, 90 - G), arc(90 + G, 270 - G)]
</script>

<template>
  <div class="agent-loop">
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="al-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" class="arrow-head" />
        </marker>
        <linearGradient id="al-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--slidev-theme-primary)" />
          <stop offset="100%" stop-color="var(--slidev-theme-secondary)" />
        </linearGradient>
      </defs>
      <path v-for="(d, i) in arcs" :key="i" :d="d" class="arc" marker-end="url(#al-arrow)" />
    </svg>
    <div class="core lg indigo">
      <div class="core-text">LLM</div>
      <div class="core-sub">agent</div>
    </div>
    <div
      v-for="n in nodes" :key="n.label" class="node lg" :class="n.tint"
      :style="{ left: `${(pos(n.angle).x / 320) * 100}%`, top: `${(pos(n.angle).y / 320) * 100}%` }"
    >
      <div class="node-label">{{ n.label }}</div>
      <div class="node-sub">{{ n.sub }}</div>
    </div>
  </div>
</template>

<style scoped>
.agent-loop { position: relative; width: 320px; height: 320px; margin: 0 auto; }
svg { width: 100%; height: 100%; overflow: visible; }
.arc { fill: none; stroke: url(#al-grad); stroke-width: 2; stroke-dasharray: 6 5; animation: march 1.4s linear infinite; }
.arrow-head { fill: var(--slidev-theme-secondary); }
@keyframes march { to { stroke-dashoffset: -22; } }
.core { position: absolute; left: 50%; top: 50%; width: 92px; height: 92px; margin: -46px 0 0 -46px; border-radius: 50% !important; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.core-text { font-family: 'Instrument Serif', serif; font-size: 26px; line-height: 1; color: var(--slidev-theme-ink); }
.core-sub { font-family: 'Archivo', sans-serif; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--slidev-theme-ink-secondary); }
.node { position: absolute; transform: translate(-50%, -50%); padding: 0.55em 1em !important; text-align: center; width: 168px; }
.node-label { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 15px; color: var(--slidev-theme-ink); }
.node-sub { white-space: nowrap; font-family: var(--mono); font-size: 10px; color: var(--slidev-theme-ink-secondary); }
</style>
