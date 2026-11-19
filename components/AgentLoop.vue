<script setup lang="ts">
/** Slide 3 — two-state agent loop: Write ⇄ Feedback, orbiting an LLM agent. */
const R = 120
const C = 160
const pos = (a: number) => ({ x: C + R * Math.cos((a * Math.PI) / 180), y: C + R * Math.sin((a * Math.PI) / 180) })
const nodes = [
  { label: 'Write', sub: 'kernel variant', angle: -90 },
  { label: 'Feedback', sub: 'profiling · correctness', angle: 90 },
]
// right arc: Write → Feedback (clockwise); left arc: Feedback → Write
const arc = (a0: number, a1: number) => {
  const p0 = pos(a0), p1 = pos(a1)
  return `M ${p0.x} ${p0.y} A ${R} ${R} 0 0 1 ${p1.x} ${p1.y}`
}
const arcs = [arc(-90 + 30, 90 - 42), arc(90 + 30, 270 - 42)]
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
      <circle :cx="C" :cy="C" r="44" class="core" />
      <text :x="C" :y="C - 3" class="core-text">LLM</text>
      <text :x="C" :y="C + 15" class="core-sub">agent</text>
    </svg>
    <div
      v-for="n in nodes" :key="n.label" class="node glass"
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
.core { fill: rgba(var(--slidev-theme-primary-rgb), 0.1); stroke: var(--slidev-theme-primary); stroke-width: 1.2; }
.core-text { font-family: 'Instrument Serif', serif; font-size: 26px; text-anchor: middle; fill: var(--slidev-theme-ink); }
.core-sub { font-family: 'Archivo', sans-serif; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; text-anchor: middle; fill: var(--slidev-theme-ink-secondary); }
.node { position: absolute; transform: translate(-50%, -50%); padding: 0.5em 1em !important; text-align: center; min-width: 120px; }
.node-label { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 15px; color: var(--slidev-theme-ink); }
.node-sub { white-space: nowrap; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--slidev-theme-ink-secondary); }
</style>
