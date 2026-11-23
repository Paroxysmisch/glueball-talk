<script setup lang="ts">
/**
 * Tiled matrix multiply, C += A · B — a 2D port of the hero animation on yash's website
 * (my-website/src/scene/shaders/matrix.frag.glsl + flow.vert/frag.glsl), re-themed for the deck.
 *
 *  · A (left), B (top), C (bottom right) are 64×64 dot-matrix slabs on an 8×8 tile grid.
 *  · Every 8 k-steps a new output tile C(ci, cj) is picked; at step k the A tile (ci, k) and
 *    B tile (k, cj) light up, one row of A / one column of B / one element of C are highlighted.
 *  · Little flickering squares (bits of a tensor) stream from the active A and B tiles into C,
 *    whose tile heats up (accent ramp) as k accumulates.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useNav } from '@slidev/client'

// PDF export: Chromium rasterises CSS-3D-transformed content at 1x (a blurry, moiré'd glyph), so in print mode we
// draw one still frame, bake the same perspective into the canvas pixels (mesh warp), and drop the CSS 3D transform.
const { isPrintMode } = useNav()
const flat = isPrintMode.value
const labelStyle = ref<Record<string, Record<string, string>>>({})
const canvasStyle = ref<Record<string, string>>({})

const props = withDefaults(defineProps<{ size?: number; speed?: number }>(), { size: 380, speed: 1 })
const canvas = ref<HTMLCanvasElement>()

// geometry (logical px) — same layout as the website: S = slab, gap between slabs
const N = 64 // elements per side
const T = 8 // tiles per side
let S = 0, GAP = 0, CELL = 0
let raf = 0

type RGB = [number, number, number]
const hex = (h: string): RGB => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h.trim())
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [99, 102, 241]
}
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

// deterministic noise (per element), like hash21 in the shader
const noise = new Float32Array(3 * N * N)
{
  let s = 7
  for (let i = 0; i < noise.length; i++) { s = (s * 16807) % 2147483647; noise[i] = s / 2147483647 }
}
const rnd8 = (n: number, salt: number) => Math.floor((((Math.sin(n * 12.9898 + salt * 78.233) * 43758.5453) % 1 + 1) % 1) * 8)

// particles: 18 from A, 18 from B (website: createMatrixFlows)
interface P { jx0: number; jy0: number; jx1: number; jy1: number; w: number; arc: number; fromA: boolean; seed: number }
const parts: P[] = []
{
  let s = 11
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
  for (let i = 0; i < 18; i++) {
    for (const fromA of [true, false]) {
      parts.push({ jx0: r() - 0.5, jy0: r() - 0.5, jx1: r() - 0.5, jy1: r() - 0.5, w: i / 18 + (fromA ? 0 : 0.5 / 18), arc: 0.9 + r() * 0.7, fromA, seed: i * 7 + (fromA ? 0 : 3) })
    }
  }
}

let colA: RGB = [99, 102, 241], colB: RGB = [6, 182, 212], colAcc: RGB = [245, 158, 11]
const ink: RGB = [26, 26, 46]
const paper: RGB = [246, 245, 241]

// origin of each slab (top-left), in logical px
const origin = (m: 0 | 1 | 2) => m === 0 ? [0, S + GAP] : m === 1 ? [S + GAP, 0] : [S + GAP, S + GAP]

function draw(ctx: CanvasRenderingContext2D, t: number) {
  const W = 2 * S + GAP
  ctx.clearRect(0, 0, W, W)

  const hp = t * 0.5
  const kk = Math.floor(hp % 8)
  const fr = hp % 1
  const cyc = Math.floor(hp / 8)
  const ci = rnd8(cyc, 1)
  const cj = rnd8(cyc, 2)
  const er = Math.floor(((t * 0.55) % 1) * 8)
  const ec = Math.floor(((t * 4.4) % 1) * 8)
  const acc = (kk + fr) / 8

  const r0 = CELL * 0.3
  for (const m of [0, 1, 2] as const) {
    const [ox, oy] = origin(m)
    // slab plate
    ctx.fillStyle = m === 2 ? 'rgba(26,26,46,0.035)' : rgba(m === 0 ? colA : colB, 0.05)
    ctx.fillRect(ox, oy, S, S)
    for (let row = 0; row < N; row++) {
      for (let col = 0; col < N; col++) {
        const v = noise[m * N * N + row * N + col]
        const rt = row >> 3, ct = col >> 3, lr = row & 7, lc = col & 7
        let lum = 0.16 + 0.34 * v
        let r = r0
        let c: RGB
        if (m < 2) {
          const isA = m === 0
          const kt = isA ? ct : rt
          const pt = isA ? rt : ct
          const strip = pt === (isA ? ci : cj) ? 1 : 0
          const act = strip && kt === kk ? 1 : 0
          const used = strip && kt < kk ? 1 : 0
          const elem = act && (isA ? lr === er : lc === ec) ? 1 : 0
          const now = act && lr === er && lc === ec ? 1 : 0
          lum += strip * 0.16 + used * 0.2 + act * (0.4 + 0.35 * elem) + now * 0.4
          r += r0 * (0.25 * act + 0.3 * elem + 0.4 * now)
          c = isA ? colA : colB
          if (now) c = mixc(c, ink, 0.35)
        } else {
          const tgt = rt === ci && ct === cj
          const elemC = tgt && lr === er && lc === ec
          if (tgt) {
            const h = 0.4 + 0.55 * acc + (elemC ? 0.4 : 0)
            lum = Math.min(1, h)
            r += r0 * (0.2 + (elemC ? 0.6 : 0))
            c = elemC ? mixc(colAcc, [180, 60, 10], 0.55) : colAcc
          } else {
            lum = 0.08 + 0.12 * v
            c = ink
          }
        }
        ctx.fillStyle = rgba(c, Math.min(1, lum))
        const x = ox + (col + 0.5) * CELL, y = oy + (row + 0.5) * CELL
        ctx.fillRect(x - r, y - r, 2 * r, 2 * r)
      }
    }
    // coarse tile grid (hero) + active tile outlines
    ctx.strokeStyle = 'rgba(26,26,46,0.07)'
    ctx.lineWidth = 0.6
    ctx.beginPath()
    for (let i = 1; i < T; i++) {
      ctx.moveTo(ox + i * S / T, oy); ctx.lineTo(ox + i * S / T, oy + S)
      ctx.moveTo(ox, oy + i * S / T); ctx.lineTo(ox + S, oy + i * S / T)
    }
    ctx.stroke()
    const tile = S / T
    let tx = -1, ty = -1, col: RGB = ink
    if (m === 0) { tx = kk; ty = ci; col = colA }
    if (m === 1) { tx = cj; ty = kk; col = colB }
    if (m === 2) { tx = cj; ty = ci; col = colAcc }
    ctx.strokeStyle = rgba(col, 0.95)
    ctx.lineWidth = 1.4
    ctx.strokeRect(ox + tx * tile, oy + ty * tile, tile, tile)
  }

  // particles: A tile (ci, kk) → C tile (ci, cj); B tile (kk, cj) → C tile
  const tile = S / T
  const flowT = t
  const [ax, ay] = origin(0), [bx, by] = origin(1), [cx, cy] = origin(2)
  const cC = [cx + (cj + 0.5) * tile, cy + (ci + 0.5) * tile]
  const sq = tile * 0.16
  for (const p of parts) {
    const s0 = p.fromA ? [ax + (kk + 0.5) * tile, ay + (ci + 0.5) * tile] : [bx + (cj + 0.5) * tile, by + (kk + 0.5) * tile]
    const start = [s0[0] + p.jx0 * tile * 0.6, s0[1] + p.jy0 * tile * 0.6]
    const end = [cC[0] + p.jx1 * tile * 0.6, cC[1] + p.jy1 * tile * 0.6]
    const q = (flowT * 0.42 + p.w) % 1
    const alpha = smooth(0, 0.1, q) * (1 - smooth(0.88, 1, q))
    if (alpha < 0.02) continue
    // perpendicular arc (stands in for the website's out-of-plane z arc)
    const dx = end[0] - start[0], dy = end[1] - start[1]
    const L = Math.hypot(dx, dy) || 1
    const nx = -dy / L, ny = dx / L
    const at = (u: number) => {
      u = Math.max(0, Math.min(1, u))
      const a = Math.sin(Math.PI * u) * p.arc * tile * 0.35 * (p.fromA ? -1 : 1)
      return [start[0] + dx * u + nx * a, start[1] + dy * u + ny * a]
    }
    const c = p.fromA ? colA : colB
    const tick = Math.floor(flowT * 8 + p.seed * 3)
    // head + 3 trailing squares, each flickering independently
    for (let k = 0; k < 4; k++) {
      const pos = at(q - k * 0.035)
      const on = hashf(p.seed + k * 3.7, tick) > (k ? 0.5 : 0.4)
      const size = sq * (k ? 0.72 - 0.17 * (k - 1) : 1)
      const a = alpha * (k ? (0.55 - 0.16 * (k - 1)) * (on ? 1 : 0.3) : (on ? 1 : 0.35))
      ctx.fillStyle = rgba(on && !k ? mixc(c, ink, 0.25) : c, a)
      ctx.fillRect(pos[0] - size / 2, pos[1] - size / 2, size, size)
    }
  }
}
const smooth = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const hashf = (a: number, b: number) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v) }

onMounted(() => {
  const el = canvas.value!
  const css = getComputedStyle(document.documentElement)
  colA = hex(css.getPropertyValue('--slidev-theme-primary') || '#6366f1')
  colB = hex(css.getPropertyValue('--slidev-theme-secondary') || '#06b6d4')
  colAcc = hex(css.getPropertyValue('--slidev-theme-accent') || '#f59e0b')
  void paper
  const W = props.size
  GAP = W * 0.03
  S = (W - GAP) / 2
  CELL = S / N
  const dpr = 3
  el.width = W * dpr
  el.height = W * dpr
  el.style.width = `${W}px`
  el.style.height = `${W}px`
  if (flat) { renderFlat(el, W, dpr); return }
  const ctx = el.getContext('2d')!
  ctx.scale(dpr, dpr)
  const t0 = performance.now()
  const loop = (now: number) => {
    draw(ctx, ((now - t0) / 1000) * props.speed + 3.2)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))

// same as the CSS: perspective(1100px) rotateY(-16deg) rotateX(6deg), transform-origin 60% 50%
function project(W: number) {
  const P = 1100, ry = (-16 * Math.PI) / 180, rx = (6 * Math.PI) / 180
  const ox = 0.6 * W, oy = 0.5 * W
  return (x: number, y: number): [number, number] => {
    const X = x - ox, Y = y - oy
    const y1 = Y * Math.cos(rx), z1 = Y * Math.sin(rx) // rotateX
    const x2 = X * Math.cos(ry) + z1 * Math.sin(ry), z2 = -X * Math.sin(ry) + z1 * Math.cos(ry) // rotateY
    const k = P / (P - z2) // perspective
    return [ox + x2 * k, oy + y1 * k]
  }
}

function renderFlat(el: HTMLCanvasElement, W: number, dpr: number) {
  // 1. one still frame, unwarped, offscreen
  const src = document.createElement('canvas')
  src.width = W * dpr
  src.height = W * dpr
  const sctx = src.getContext('2d')!
  sctx.scale(dpr, dpr)
  draw(sctx, 3.2 + 2.6)
  // 2. bounds of the warped square
  const pj = project(W)
  const corners = [pj(0, 0), pj(W, 0), pj(0, W), pj(W, W)]
  const minX = Math.floor(Math.min(...corners.map(c => c[0]))), maxX = Math.ceil(Math.max(...corners.map(c => c[0])))
  const minY = Math.floor(Math.min(...corners.map(c => c[1]))), maxY = Math.ceil(Math.max(...corners.map(c => c[1])))
  el.width = (maxX - minX) * dpr
  el.height = (maxY - minY) * dpr
  canvasStyle.value = { position: 'absolute', left: `${minX}px`, top: `${minY}px`, width: `${maxX - minX}px`, height: `${maxY - minY}px` }
  // 3. mesh warp: each grid cell -> two affine-mapped triangles
  const ctx = el.getContext('2d')!
  const n = 32, step = W / n
  const to = (x: number, y: number): [number, number] => { const [u, v] = pj(x, y); return [(u - minX) * dpr, (v - minY) * dpr] }
  const tri = (s: [number, number][], d: [number, number][]) => {
    const [[x0, y0], [x1, y1], [x2, y2]] = s.map(([x, y]) => [x * dpr, y * dpr])
    const [[u0, v0], [u1, v1], [u2, v2]] = d
    const den = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)
    const a = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / den
    const c = ((u2 - u0) * (x1 - x0) - (u1 - u0) * (x2 - x0)) / den
    const b = ((v1 - v0) * (y2 - y0) - (v2 - v0) * (y1 - y0)) / den
    const dd = ((v2 - v0) * (x1 - x0) - (v1 - v0) * (x2 - x0)) / den
    // clip to the destination triangle, nudged outwards a little so neighbouring triangles leave no seams
    const cx = (u0 + u1 + u2) / 3, cy = (v0 + v1 + v2) / 3
    const grow = (u: number, v: number): [number, number] => { const l = Math.hypot(u - cx, v - cy) || 1; return [u + ((u - cx) / l) * 0.8, v + ((v - cy) / l) * 0.8] }
    ctx.save()
    ctx.beginPath()
    for (const [i, [u, v]] of [[u0, v0], [u1, v1], [u2, v2]].entries()) { const [gu, gv] = grow(u, v); i ? ctx.lineTo(gu, gv) : ctx.moveTo(gu, gv) }
    ctx.closePath()
    ctx.clip()
    ctx.setTransform(a, b, c, dd, u0 - a * x0 - c * y0, v0 - b * x0 - dd * y0)
    ctx.drawImage(src, 0, 0)
    ctx.restore()
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x0 = i * step, y0 = j * step, x1 = x0 + step, y1 = y0 + step
      tri([[x0, y0], [x1, y0], [x0, y1]], [to(x0, y0), to(x1, y0), to(x0, y1)])
      tri([[x1, y0], [x1, y1], [x0, y1]], [to(x1, y0), to(x1, y1), to(x0, y1)])
    }
  }
  // 4. labels: same anchor points as the CSS, pushed through the projection
  const [ax, ay] = pj(-22, 0.74 * W), [bx, by] = pj(0.74 * W, -30), [cx, cy] = pj(W + 20, 0.74 * W)
  labelStyle.value = {
    a: { left: `${ax}px`, top: `${ay}px` },
    b: { left: `${bx}px`, top: `${by}px` },
    c: { left: 'auto', right: `${W - cx}px`, top: `${cy}px` },
  }
}
</script>

<template>
  <div class="mma-glyph" :class="{ flat }" :style="flat ? { width: `${props.size}px`, height: `${props.size}px` } : {}">
    <canvas ref="canvas" :style="canvasStyle" />
    <span class="lbl a" :style="labelStyle.a">A</span>
    <span class="lbl b" :style="labelStyle.b">B</span>
    <span class="lbl c" :style="labelStyle.c">C</span>
  </div>
</template>

<style scoped>
.mma-glyph { position: relative; display: inline-block; transform: perspective(1100px) rotateY(-16deg) rotateX(6deg); transform-origin: 60% 50%; }
canvas { display: block; }
.mma-glyph.flat { transform: none; }
.lbl { position: absolute; font-family: 'Instrument Serif', serif; font-style: italic; font-size: 22px; color: var(--slidev-theme-ink-secondary); opacity: 0.6; }
.lbl.a { left: -22px; top: 74%; }
.lbl.b { left: 74%; top: -30px; }
.lbl.c { right: -20px; top: 74%; }
</style>
