<script setup lang="ts">
/**
 * Slide 14 — the camera dives down the compiler stack, a check at each level.
 * step 0: Gluon ✓ (today) · 1: TTGIR ✓ · 2: PTX ✓ · 3: hardware in view
 */
import { computed } from 'vue'
const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })

const levels = [
  { name: 'Gluon', tag: 'verified today', code: 'tma.async_copy_global_to_shared(desc, [m, k], bar, smem)' },
  { name: 'TTGIR', tag: 'same Z3 interpreter, lower IR', code: 'ttng.async_tma_copy_global_to_local %desc[%m, %k] %smem, %bar' },
  { name: 'PTX', tag: 'formal PTX memory model', code: 'cp.async.bulk.tensor.2d.shared::cluster.global.mbarrier::complete_tx::bytes [%r1], [%rd2, {%r3, %r4}], [%r5];' },
  { name: 'GPU', tag: 'what actually runs', code: 'SASS · silicon', hw: true },
]
const SPACING = 96
const shift = computed(() => Math.min(props.step, 2) * SPACING * 0.55)
const verified = (i: number) => i < 3 && props.step >= i
const focus = (i: number) => Math.min(props.step, 3) === i
</script>

<template>
  <div class="sd">
    <div class="rail" :style="{ transform: `translateY(${-shift}px)` }">
      <div class="spine" />
      <div
        v-for="(l, i) in levels" :key="l.name"
        class="lvl" :class="{ focus: focus(i), done: verified(i), hw: l.hw }"
        :style="{ top: `${i * SPACING}px` }"
      >
        <div class="check" :class="{ on: verified(i) }">✓</div>
        <div class="body lg" :class="focus(i) ? 'indigo' : 'slate'">
          <div class="head">
            <span class="name">{{ l.name }}</span>
            <span class="tag">{{ l.tag }}</span>
          </div>
          <code class="code">{{ l.code }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sd { position: relative; height: 340px; overflow: hidden;
  -webkit-mask: linear-gradient(180deg, transparent 0, #000 8%, #000 88%, transparent 100%);
  mask: linear-gradient(180deg, transparent 0, #000 8%, #000 88%, transparent 100%); }
.rail { position: relative; padding-top: 22px; height: 100%; transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1); }
.spine { position: absolute; left: 19px; top: 40px; height: 300px; width: 1.5px; background: linear-gradient(180deg, var(--slidev-theme-primary), var(--slidev-theme-secondary)); opacity: 0.4; }
.lvl { position: absolute; left: 0; right: 24px; margin-top: 22px; display: flex; gap: 16px; align-items: flex-start; opacity: 0.35; transform: scale(0.94); transform-origin: left center; transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
.lvl.focus, .lvl.done { opacity: 1; }
.lvl.focus { transform: scale(1.03); }
.lvl.done:not(.focus) { opacity: 0.6; }
.check { flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-size: 20px; font-weight: 700;
  border: 1.5px dashed var(--slidev-theme-border); color: transparent; background: var(--slidev-theme-bg); transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.check.on { border: 1.5px solid #10b981; background: #10b981; color: white; transform: scale(1.05); }
.hw .check { border-style: solid; border-color: var(--slidev-theme-ink-secondary); }
.body { flex: 1; min-width: 0; padding: 8px 14px; }
.head { display: flex; align-items: baseline; gap: 12px; }
.name { font-family: 'Instrument Serif', serif; font-size: 28px; line-height: 1.1; color: var(--slidev-theme-ink); }
.tag { font-family: 'Archivo', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--slidev-theme-ink-secondary); }
.code { display: block; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: var(--slidev-theme-ink-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: none !important; border: none !important; padding: 0 !important; }
</style>
