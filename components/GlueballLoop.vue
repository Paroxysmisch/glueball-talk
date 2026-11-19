<script setup lang="ts">
/**
 * Slide 6 — the poster's optimise → verify → benchmark loop, built box by box.
 * step 1: translation + model · 2 profile · 3 propose · 4 implement · 5 verify
 * 6: benchmark + repeat loop · 7: retry-with-feedback arrow (last)
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })

const W = 112, G = 22, Y = 110, H = 60
const boxes = [
  { t: 'AST translation', s: 'Triton → Gluon', k: 'tr', at: 1 },
  { t: 'Gluon model', s: 'K kernels', k: 'gl', at: 1 },
  { t: 'Profile', s: 'ncu · Proton', k: 'opt', at: 2 },
  { t: 'Propose', s: 'ranked portfolio', k: 'opt', at: 3 },
  { t: 'Implement', s: 'step by step', k: 'opt', at: 4 },
  { t: 'Verify', s: 'tests + Z3 tools', k: 'ver', at: 5 },
  { t: 'Benchmark', s: 'unseen shapes', k: 'bm', at: 6 },
].map((b, i) => ({ ...b, x: i * (W + G) }))

const cx = (i: number) => boxes[i].x + W / 2
const on = (n: number) => props.step >= n
/** arrowhead with its tip at (x, y); drawn separately so it only appears once the path has finished drawing */
const head = (x: number, y: number, dir: 'up' | 'down') => {
  const d = dir === 'down' ? -1 : 1
  return `M ${x} ${y} L ${x - 5} ${y + 9 * d} L ${x + 5} ${y + 9 * d} Z`
}
</script>

<template>
  <div class="gl-loop">
    <svg viewBox="-4 0 920 270" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="gl-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--slidev-theme-ink-secondary)" /></marker>
        <marker id="gl-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#e11d48" /></marker>
        <marker id="gl-y" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#f59e0b" /></marker>
      </defs>

      <!-- forward arrows -->
      <line
        v-for="i in boxes.length - 1" :key="'e' + i"
        :x1="boxes[i - 1].x + W + 2" :x2="boxes[i].x - 3" :y1="Y + H / 2" :y2="Y + H / 2"
        class="edge fade" :class="{ on: on(boxes[i].at) }" marker-end="url(#gl-a)"
      />

      <!-- repeat loop: benchmark → back to Gluon model (above) -->
      <path
        :d="`M ${cx(6)} ${Y - 6} V ${Y - 46} H ${cx(1)} V ${Y - 8}`"
        class="repeat draw" :class="{ on: on(6) }" pathLength="1"
      />
      <path :d="head(cx(1), Y - 8, 'down')" class="head-y head" :class="{ on: on(6) }" />
      <text :x="(cx(1) + cx(6)) / 2" :y="Y - 54" class="tag tag-y fade" :class="{ on: on(6) }">repeat until max. rounds</text>

      <!-- retry loop: verify → implement (below) -->
      <path
        :d="`M ${cx(5)} ${Y + H + 6} V ${Y + H + 46} H ${cx(4)} V ${Y + H + 8}`"
        class="retry draw" :class="{ on: on(7) }" pathLength="1"
      />
      <path :d="head(cx(4), Y + H + 8, 'up')" class="head-r head" :class="{ on: on(7) }" />
      <text :x="(cx(4) + cx(5)) / 2" :y="Y + H + 66" class="tag tag-r fade" :class="{ on: on(7) }">reject: retry with feedback</text>

      <!-- boxes -->
      <g v-for="b in boxes" :key="b.t" class="box fade" :class="[b.k, { on: on(b.at) }]">
        <rect :x="b.x" :y="Y" :width="W" :height="H" rx="8" />
        <text :x="b.x + W / 2" :y="Y + H / 2 + 5" class="bt">{{ b.t }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.gl-loop svg { width: 100%; height: auto; overflow: visible; }
.box rect { stroke-width: 1.4; }
.box.tr rect { fill: rgba(124, 58, 237, 0.10); stroke: #8b5cf6; }
.box.gl rect { fill: rgba(245, 158, 11, 0.12); stroke: #f59e0b; }
.box.opt rect { fill: rgba(99, 102, 241, 0.10); stroke: #6366f1; }
.box.ver rect { fill: rgba(16, 185, 129, 0.14); stroke: #10b981; stroke-width: 2; }
.box.bm rect { fill: rgba(100, 116, 139, 0.10); stroke: #94a3b8; }
.bt { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 14px; text-anchor: middle; fill: var(--slidev-theme-ink); }
.bs { font-family: 'JetBrains Mono', monospace; font-size: 8.2px; text-anchor: middle; fill: var(--slidev-theme-ink-secondary); }
.edge { stroke: var(--slidev-theme-ink-secondary); stroke-width: 1.4; }
.repeat { fill: none; stroke: #f59e0b; stroke-width: 1.8; }
.head { opacity: 0; transition: opacity 0.25s ease; }
.head.on { opacity: 1; transition-delay: 0.9s; }
.head-y { fill: #f59e0b; }
.head-r { fill: #e11d48; }
.retry { fill: none; stroke: #e11d48; stroke-width: 2; }
.tag { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 17px; text-anchor: middle; }
.tag-y { fill: #b45309; }
.tag-r { fill: #e11d48; }
.tag-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; text-anchor: middle; fill: var(--slidev-theme-ink-secondary); }
.phase { font-family: 'Archivo', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; text-anchor: middle; fill: var(--slidev-theme-ink-secondary); }

.fade { opacity: 0; transform: translateY(8px); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.fade.on { opacity: 1; transform: none; }

.draw { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1); }
.draw.on { stroke-dashoffset: 0; }
.retry.on { animation: retry-pulse 2.4s ease-in-out 1s infinite; }
@keyframes retry-pulse { 50% { stroke-width: 3; } }
</style>
