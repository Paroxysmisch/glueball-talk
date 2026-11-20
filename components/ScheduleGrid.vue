<script setup lang="ts">
/**
 * Slide 13 — the space of software-pipelining schedules.
 * Columns: number of stages (1–8). Rows: tile × warp configurations.
 * step 1: resource check (shared-memory budget) greys out cells
 * step 2: safety check (in-flight copies vs. stages → races) strikes cells
 * step 3: history from earlier rounds ranks the survivors
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })

const stages = [1, 2, 3, 4, 5, 6, 7, 8]
const configs = [
  { label: '64×64 · 4w', kb: 16 },
  { label: '64×128 · 4w', kb: 24 },
  { label: '128×64 · 8w', kb: 24 },
  { label: '128×128 · 8w', kb: 32 },
  { label: '128×256 · 8w', kb: 48 },
  { label: '256×128 · 12w', kb: 48 },
]
const BUDGET = 128 // KB shared memory on the target (illustrative)

type Cell = { r: number; c: number; res: boolean; safe: boolean; rank: number }
const cells: Cell[] = []
configs.forEach((cfg, r) => stages.forEach((s, c) => {
  const res = s * cfg.kb <= BUDGET
  // illustrative safety rule: deep pipelines with 1 consumer-warpgroup allow
  // more in-flight copies than slots in some configs → stage aliasing
  const safe = !((r + c) % 3 === 1 && s > 1)
  cells.push({ r, c, res, safe, rank: 0 })
}))
// pretend history ranks a few survivors
const top = [[1, 2], [2, 1], [0, 3]]
top.forEach(([r, c], i) => {
  const cell = cells.find(x => x.r === r && x.c === c)
  if (cell) cell.rank = i + 1
})

const state = (x: Cell) => {
  if (props.step >= 1 && !x.res) return 'res'
  if (props.step >= 2 && !x.safe) return 'unsafe'
  if (props.step >= 3 && x.rank) return 'top'
  return 'open'
}
const survivors = () => cells.filter(x => x.res && x.safe).length
</script>

<template>
  <div class="sg">
    <div class="corner micro-label">tile · warps ╲ stages</div>
    <div v-for="s in stages" :key="'h' + s" class="colh">{{ s }}</div>
    <template v-for="(cfg, r) in configs" :key="cfg.label">
      <div class="rowh">{{ cfg.label }}</div>
      <div
        v-for="c in stages.length" :key="c"
        class="cell" :class="state(cells[r * stages.length + c - 1])"
        :style="{ transitionDelay: `${((r + c) % 7) * 40}ms` }"
      >
        <span v-if="state(cells[r * stages.length + c - 1]) === 'top'" class="rank">#{{ cells[r * stages.length + c - 1].rank }}</span>
      </div>
    </template>
  </div>
  <div class="legend">
    <span class="lgd"><i class="sw open" />{{ props.step >= 2 ? `${survivors()} of ${cells.length} left` : `${cells.length} candidate schedules` }}</span>
    <span class="lgd fade" :class="{ on: props.step >= 1 }"><i class="sw res" />exceeds shared memory / registers</span>
    <span class="lgd fade" :class="{ on: props.step >= 2 }"><i class="sw unsafe" />fails a safety check (race, deadlock)</span>
    <span class="lgd fade" :class="{ on: props.step >= 3 }"><i class="sw top" />ranked by earlier rounds</span>
  </div>
</template>

<style scoped>
.sg { display: grid; grid-template-columns: 110px repeat(8, 1fr); gap: 5px; align-items: center; }
.corner { font-size: 8.5px !important; opacity: 0.5; letter-spacing: 0.08em !important; }
.colh { text-align: center; font-family: var(--mono); font-size: 11px; color: var(--slidev-theme-ink-secondary); }
.rowh { font-family: var(--mono); font-size: 10.5px; color: var(--slidev-theme-ink-secondary); }
.cell { position: relative; height: 30px; border-radius: 4px; transition: all 0.5s ease; display: grid; place-items: center; }
.cell.open { background: rgba(var(--slidev-theme-primary-rgb), 0.18); border: 1px solid rgba(var(--slidev-theme-primary-rgb), 0.45); }
.cell.res { background: rgba(100, 116, 139, 0.10); border: 1px solid rgba(100, 116, 139, 0.18);
  background-image: linear-gradient(to top right, transparent calc(50% - 0.6px), rgba(100, 116, 139, 0.45) 50%, transparent calc(50% + 0.6px)); }
.cell.unsafe { background: rgba(225, 29, 72, 0.08); border: 1px solid rgba(225, 29, 72, 0.4);
  background-image: linear-gradient(to top right, transparent calc(50% - 0.6px), rgba(225, 29, 72, 0.7) 50%, transparent calc(50% + 0.6px)); }
.cell.top { background: var(--slidev-theme-primary); border: 1px solid var(--slidev-theme-primary); box-shadow: 0 0 0 4px rgba(var(--slidev-theme-primary-rgb), 0.15); }
.rank { font-family: var(--mono); font-size: 11px; font-weight: 700; color: white; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 14px; }
.lgd { display: inline-flex; align-items: center; gap: 7px; font-family: 'Source Serif 4', serif; font-size: 12.5px; color: var(--slidev-theme-ink-secondary); }
.sw { display: inline-block; width: 14px; height: 14px; border-radius: 3px; }
.sw.open { background: rgba(var(--slidev-theme-primary-rgb), 0.3); border: 1px solid rgba(var(--slidev-theme-primary-rgb), 0.5); }
.sw.res { background: rgba(100, 116, 139, 0.2); }
.sw.unsafe { background: rgba(225, 29, 72, 0.25); border: 1px solid #e11d48; }
.sw.top { background: var(--slidev-theme-primary); }
.fade { opacity: 0; transition: opacity 0.4s ease; }
.fade.on { opacity: 1; }
</style>
