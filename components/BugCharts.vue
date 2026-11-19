<script setup lang="ts">
/**
 * Slide 9 — correctness-suite results (paper Fig. 4) as two grouped bar charts:
 *  · bugs found on the generic suite (of 24)  — higher is better
 *  · false alarms on the synchronisation suite (of 12) — lower is better
 * Each model: the LLM alone vs the same LLM with Glueball. Bars grow in when the slide appears.
 */
import { useAutoplay } from '../utils/autoplay'

const { on, instant } = useAutoplay(300)

const models = ['DeepSeek V4 Pro', 'DeepSeek V4 Flash', 'Meta Muse Spark 1.3', 'GPT 5.6 Sol']
const charts = [
  { title: 'Bugs found', sub: 'generic suite · of 24', dir: 'higher is better', max: 24, ticks: [0, 6, 12, 18, 24], base: [21, 22, 22, 21], gb: [24, 24, 24, 23] },
  { title: 'False alarms', sub: 'synchronisation suite · of 12', dir: 'lower is better', max: 8, ticks: [0, 2, 4, 6, 8], base: [7, 1, 3, 1], gb: [2, 0, 0, 0] },
]
const delta = (a: number, b: number) => (b - a > 0 ? `+${b - a}` : b - a < 0 ? `−${a - b}` : '±0')
</script>

<template>
  <div class="bc" :class="{ on, instant }">
    <div class="legend">
      <span><i class="sw base" />LLM alone</span>
      <span><i class="sw gb" />with Glueball</span>
    </div>
    <div class="charts">
      <div v-for="(c, ci) in charts" :key="c.title" class="chart">
        <div class="head">
          <span class="t">{{ c.title }}</span>
          <span class="s">{{ c.sub }} · <em>{{ c.dir }}</em></span>
        </div>
        <div class="deltas">
          <span v-for="(m, i) in models" :key="m"><span class="delta" :style="{ '--d': `${ci * 0.3 + i * 0.08 + 0.9}s` }">{{ delta(c.base[i], c.gb[i]) }}</span></span>
        </div>
        <div class="plot">
          <div class="yaxis">
            <span v-for="t in c.ticks" :key="t" :style="{ bottom: `${(t / c.max) * 100}%` }">{{ t }}</span>
          </div>
          <div class="area">
            <div v-for="t in c.ticks" :key="'g' + t" class="grid" :style="{ bottom: `${(t / c.max) * 100}%` }" />
            <div v-for="(m, i) in models" :key="m" class="group">
              <div class="pair">
                <div class="bar base" :style="{ '--h': `${(c.base[i] / c.max) * 100}%`, '--d': `${ci * 0.3 + i * 0.08}s` }">
                  <span class="v">{{ c.base[i] }}</span>
                </div>
                <div class="bar gb" :style="{ '--h': `${(c.gb[i] / c.max) * 100}%`, '--d': `${ci * 0.3 + i * 0.08 + 0.15}s` }">
                  <span class="v">{{ c.gb[i] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="xaxis">
          <span v-for="m in models" :key="m">{{ m }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bc { display: flex; flex-direction: column; gap: 6px; margin-top: -6px; }
.legend { display: flex; gap: 20px; justify-content: flex-end; font-family: 'Source Serif 4', serif; font-size: 13px; color: var(--slidev-theme-ink-secondary); }
.legend span { display: inline-flex; align-items: center; gap: 7px; }
.sw { display: inline-block; width: 13px; height: 13px; border-radius: 3px; }
.sw.base { background: #cbd2dd; }
.sw.gb { background: linear-gradient(180deg, var(--slidev-theme-secondary), var(--slidev-theme-primary)); }

.charts { display: grid; grid-template-columns: 1fr 1fr; gap: 44px; }
.head { display: flex; flex-direction: column; margin-bottom: 8px; }
.head .t { font-family: 'Instrument Serif', serif; font-size: 24px; line-height: 1.1; color: var(--slidev-theme-ink); }
.head .s { font-family: 'Archivo', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--slidev-theme-ink-secondary); }
.head .s em { font-family: 'Source Serif 4', serif; font-weight: 400; letter-spacing: 0; text-transform: none; }

.deltas { display: grid; grid-template-columns: repeat(4, 1fr); margin-left: 26px; margin-bottom: 14px; text-align: center; }
.plot { display: grid; grid-template-columns: 26px 1fr; height: 140px; }
.yaxis { position: relative; }
.yaxis span { position: absolute; right: 6px; transform: translateY(50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--slidev-theme-ink-secondary); }
.area { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid var(--slidev-theme-ink); }
.grid { position: absolute; left: 0; right: 0; border-top: 1px solid var(--slidev-theme-border-soft); }
.group { position: relative; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; }
.pair { display: flex; align-items: flex-end; gap: 5px; height: 100%; }
.bar { position: relative; width: 26px; height: 0; border-radius: 5px 5px 0 0; transition: height 0.9s cubic-bezier(0.4, 0, 0.2, 1); transition-delay: var(--d); }
.on .bar { height: var(--h); }
.bar.base { background: #cbd2dd; }
.bar.gb { background: linear-gradient(180deg, var(--slidev-theme-secondary), var(--slidev-theme-primary)); box-shadow: 0 6px 14px -8px rgba(var(--slidev-theme-primary-rgb), 0.8); }
.bar .v { position: absolute; left: 50%; bottom: 100%; transform: translate(-50%, -3px); font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--slidev-theme-ink-secondary); opacity: 0; transition: opacity 0.3s ease; transition-delay: calc(var(--d) + 0.7s); }
.bar.gb .v { color: var(--slidev-theme-ink); font-weight: 700; }
.on .bar .v { opacity: 1; }
.delta { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #059669; background: rgba(16, 185, 129, 0.1); border-radius: 4px; padding: 1px 6px; opacity: 0; transition: opacity 0.3s ease; transition-delay: var(--d); }
.on .delta { opacity: 1; }

.xaxis { display: grid; grid-template-columns: repeat(4, 1fr); margin-left: 26px; margin-top: 6px; }
.xaxis span { text-align: center; font-family: 'Archivo', sans-serif; font-size: 11px; font-weight: 600; line-height: 1.25; color: var(--slidev-theme-ink); padding: 0 4px; }
.note { font-family: 'Source Serif 4', serif; font-style: italic; font-size: 12.5px; color: var(--slidev-theme-ink-secondary); }

.instant .bar, .instant .v, .instant .delta { transition: none !important; }
</style>
