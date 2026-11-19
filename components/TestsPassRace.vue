<script setup lang="ts">
/**
 * Slide 4 — a green "all tests pass" badge; zoom in on one schedule
 * where an async copy and a read overlap on the same buffer.
 * step 0: badge · 1: zoom into timeline · 2: overlap turns red
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
</script>

<template>
  <div class="tpr" :class="{ zoomed: props.step >= 1, raced: props.step >= 2 }">
    <div class="badge">
      <span class="tick">✓</span>
      <div>
        <div class="badge-title">All tests pass</div>
        <div class="badge-sub">24 / 24 inputs · 1 run each</div>
      </div>
    </div>

    <div class="lens glass">
      <div class="lens-head micro-label">Shared memory race</div>
      <svg viewBox="0 0 560 120" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="34" class="lbl">async copy</text>
        <text x="0" y="50" class="lbl-sub">writes buf 0</text>
        <text x="0" y="94" class="lbl">consumer</text>
        <text x="0" y="110" class="lbl-sub">reads buf 0</text>
        <line x1="110" x2="556" y1="62" y2="62" class="mid" />

        <rect x="130" y="18" width="250" height="34" rx="5" class="copy" />
        <text x="255" y="40" class="txt">copy tile 2 → buf 0</text>

        <rect x="330" y="78" width="200" height="34" rx="5" class="read" />
        <text x="430" y="100" class="txt">read buf 0</text>

        <!-- overlap -->
        <rect x="330" y="14" width="50" height="102" rx="4" class="overlap" />
        <text x="355" y="8" class="race-txt">RACE</text>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.tpr { position: relative; height: 330px; }
.badge {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(1.25);
  display: flex; align-items: center; gap: 18px;
  padding: 18px 30px; border-radius: 14px;
  background: rgba(16, 185, 129, 0.12); border: 1.5px solid #10b981;
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
.tick { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; background: #10b981; color: white; font-size: 26px; font-weight: 700; }
.badge-title { font-family: 'Archivo', sans-serif; font-weight: 700; font-size: 24px; color: #047857; }
.badge-sub { white-space: nowrap; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--slidev-theme-ink-secondary); }
html.dark .badge-title { color: #34d399; }

.zoomed .badge { left: 0; top: 0; transform: translate(0, 0) scale(0.72); transform-origin: top left; }

.lens {
  position: absolute; left: 8%; right: 0; top: 96px;
  opacity: 0; transform: scale(0.3); transform-origin: 0 0;
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 1em 1.4em !important;
}
.zoomed .lens { opacity: 1; transform: none; }
.lens-head { opacity: 0.6; margin-bottom: 6px; }
.lens svg { width: 100%; height: auto; overflow: visible; }
.lens-foot { margin: 6px 0 0 !important; font-size: 13px !important; font-style: italic; }

.lbl { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 13px; fill: var(--slidev-theme-ink); }
.lbl-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: var(--slidev-theme-ink-secondary); }
.mid { stroke: var(--slidev-theme-border); }
.copy { fill: rgba(99, 102, 241, 0.18); stroke: #6366f1; stroke-width: 1.2; }
.read { fill: rgba(16, 185, 129, 0.16); stroke: #10b981; stroke-width: 1.2; }
.txt { font-family: 'JetBrains Mono', monospace; font-size: 11px; text-anchor: middle; fill: var(--slidev-theme-ink); }
.overlap { fill: rgba(225, 29, 72, 0); stroke: rgba(225, 29, 72, 0); stroke-width: 1.5; transition: all 0.6s ease 0.1s; }
.race-txt { font-family: 'Archivo', sans-serif; font-weight: 800; font-size: 12px; letter-spacing: 0.18em; text-anchor: middle; fill: #e11d48; opacity: 0; transition: opacity 0.5s ease 0.3s; }
.raced .overlap { fill: rgba(225, 29, 72, 0.28); stroke: #e11d48; animation: pulse 1.6s ease-in-out 0.7s infinite; }
.raced .race-txt { opacity: 1; }
@keyframes pulse { 50% { fill: rgba(225, 29, 72, 0.12); } }
</style>
