<script setup lang="ts">
/** Slide 5 — PyTorch → Triton → Gluon → PTX with Gluon highlighted. */
const layers = [
  { name: 'PyTorch', sub: 'model' },
  { name: 'Triton', sub: 'tile-level DSL' },
  { name: 'Gluon', sub: 'tiles + hardware control', hl: true },
  { name: 'PTX', sub: 'virtual ISA' },
]
</script>

<template>
  <div class="cstack">
    <template v-for="(l, i) in layers" :key="l.name">
      <div class="layer lg" :class="l.hl ? 'indigo hl' : 'slate'">
        <div class="layer-name">{{ l.name }}</div>
        <div class="layer-sub">{{ l.sub }}</div>
      </div>
      <div v-if="i < layers.length - 1" class="arrow">→</div>
    </template>
  </div>
</template>

<style scoped>
.cstack { display: flex; align-items: center; justify-content: center; gap: 14px; }
.layer {
  padding: 10px 22px; border-radius: 8px; text-align: center; min-width: 120px;
  opacity: 0.7;
}
.layer-name { font-family: 'Instrument Serif', serif; font-size: 28px; line-height: 1.1; color: var(--slidev-theme-ink); }
.layer-sub { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: var(--slidev-theme-ink-secondary); }
.layer.hl {
  opacity: 1; transform: scale(1.12);
  border-width: 1.5px;
}
.layer.hl .layer-name { color: var(--slidev-theme-primary); }
.arrow { font-size: 20px; color: var(--slidev-theme-ink-secondary); opacity: 0.6; }
</style>
