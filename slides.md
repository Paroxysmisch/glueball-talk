---
theme: ./slidev-theme
title: Glueball
info: |
  Glueball: Agentic Generation and Verification of Hardware-Optimized Gluon Kernels.
  Yash Shah · University of Cambridge
transition: morph
colorSchema: light
mdc: true
fonts:
  sans: Archivo
  serif: Instrument Serif
  mono: Geist Mono
  weights: '300,400,500,600,700'
themeConfig:
  primary: '#6366f1'
  secondary: '#06b6d4'
  accent: '#f59e0b'
  author: Yash Shah · University of Cambridge
layout: cover
---

<div class="cover-glyph"><MmaGlyph :size="330" /></div>

# Glueball

Agentic generation and verification of hardware-optimised Gluon kernels

<!--
Hi, I'm Yash.

PhD student working on automating systems development to optimise training and inference for machine learning workloads

Presenting my work Glueball
-->

---

# AI compute demand is exploding

<ComputeDemand />

<p class="sources">Sources: Epoch AI, <em>How many AI models will exceed compute thresholds?</em> (2025) · Goldman Sachs Research, via Goldman Sachs Insights, <em>AI Agents Forecast to Boost Tech Cash Flow as Usage Soars</em> (May 2026).</p>

<!--
Model capability has largely been driven by scaling laws, and demand for compute is growing on two fronts.

[left] Training. Today there are essentially no models trained with more than 10^27 FLOPs. By 2030, Epoch expects over a hundred.

[right] And inference is growing even faster. 
Goldman Sachs estimates the world processed about 5.6 quadrillion tokens a month in 2026.
They forecast about 120 quadrillion a month by 2030, roughly 70 times more, mostly driven by agentic workloads
-->

---

# Increasing power alone can't close the gap

<PowerWall class="mt-2" />

<p class="sources">Sources: IEA, <em>Key Questions on Energy and AI</em> (2026) · Sightline Climate (2026) · NVIDIA DGX / GB200 / GB300 / Vera Rubin specifications · Uptime Institute, <em>Global Data Center Survey</em> (2025).</p>

<!--
The obvious answer is to just build more data centres and plug in more power. That runs into two walls.

[left] First, power infrastructure is slow, taking years to even build-out new Transformers.
Meanwhile NVIDIA ships a new GPU generation every year.
Already, 30 to 50% of the large data-centre projects planned for 2026 are expected to be delayed, mostly by power.

[right] Second, power density.
We are already pushing it to its limits.
There's a limit to how power-hungry your chips in a rack can be by our ability to dissipate that heat.
To put the Rubin Ultra number into perspective, a house's peak power consumption is around 10kW.
A single Rubin Ultra rack will draw the same power as a small neighborhood in the volume of a large fridge.
-->

---

# Architecture must deliver the rest

<ComputeSources class="mt-2" />

<p class="sources">Sources: AI 2027, <em>Compute Forecast</em> (2025) · IEA, <em>Key Questions on Energy and AI</em> (2026) · TSMC Technology Symposium roadmaps (2025, 2026).</p>

<!--
Even if AI data centres grow their power 4.5 times, which is what the IEA expects, and we follow the best TSMC process roadmap for about 2.3 times, that's only about 10 times combined.

The remaining 13 times, more than power and process node combined, has to come from architecture: specialised arithmetic units, lower precision, asynchronous data movement.

However, more complex hardware means the software we have to write to get the most out of it also becomes MUCH more complicated.

(Assumptions/data: demand = 2.25^(t-2024), AI 2027's global AI-compute growth, extended past 2027 → ×130. Power: IEA Apr 2026, AI-focused data-centre electricity +50% in 2025 and ×3 2025→2030 → ×4.5 vs 2024 (all data centres: 485 → 950 TWh, ×2). Node: TSMC power reduction at the same speed, best node each year vs N3E: N2 2025 (×1.38), A16 2027 (×1.67), A14 2028 (×1.90), A12 2029 (not disclosed; assumed like A14 vs N2 → ×2.3); cross-check: TSMC's Kevin Zhang, "every two years, we drive 30% efficiency" → 1.3^3 ≈ 2.2. Architecture & software = 130 / (4.5 × 2.3) ≈ ×12.5.)
-->

---

# Software takes years to catch up

<p class="lede">Time from each GPU's launch until FlashAttention reaches ~70% of its theoretical peak.</p>

<FaTimeline class="mt-2" />

<p class="sources">Sources: NVIDIA launch announcements (A100, H100, B200) · Dao et al., <em>FlashAttention</em> (2022) and <em>FlashAttention-2</em> (2023) · Shah et al., <em>FlashAttention-3</em> (2024) · Zadouri et al., <em>FlashAttention-4</em> (2026). Utilisation as reported by each paper.</p>

<!--
Here's what that looks like in practice, for one of the most important kernels in AI: attention.

With every Nvidia hardware launch it takes a team of human experts about two to three years to fully use the hardware, and often by then the next generation has arrived.
-->

---

# ML Accelerators are becoming complex

<p class="lede">Modern Hopper and Blackwell GPUs rely on <em>overlapping</em> work to maximise hardware utilization.</p>

<AsyncTimeline class="mt-6" />

<!--
To give a concrete example of complexity, modern GPUs like Hopper and Blackwell don't just run more threads. They overlap work.

However maximising this overlap requires rethinking algorithmic implementation to revolve around a particular hardware implementation.
-->

---

# Agents are good at this search

<div class="grid grid-cols-[1fr_330px] gap-12 items-center mt-4">
<div>

<p class="lede">Compilers can't keep up with hardware that changes every generation:</p>

<ul class="why">
<li><strong>New units</strong> (TMA, async MMA, TMEM) need new compiler passes</li>
<li><strong>Fixed heuristics</strong> cannot adapt to unique computation patterns</li>
<li><strong>Scheduling</strong> of different hardware units well is difficult</li>
</ul>

<p class="but">Humans can't hand-optimise every kernel. Agents can:</p>

<AutoStagger>

- **Understand** novel hardware intricacies
- **Adapt** expert patterns to new kernels
- **Explore** novel designs by combining optimisations
- **Refine** them using profiler feedback

</AutoStagger>

</div>

<AgentLoop />

</div>

<!--
Why are compilers struggling? Three reasons.

First, every generation adds new hardware.
Each one needs new compiler passes and cost models tuned by experts, which takes years to refine.

Second, some kernels have peculiar computational patterns, which require very particular use of the hardware.

Third, the right answer is rarely obvious. E.g. how to split a kernel into producer and consumer warps,
how many pipeline stages,
which memory layout:
the best choice depends on the structure of each kernel, so fixed rules and autotuning leave performance on the table.

Third, the compiler people themselves have conceded this. Triton added Gluon, a lower-level language, precisely so that experts can hand-write what the compiler can't do automatically.

And humans are not fast enough, and don't scale to hundreds or thousands of kernels. Fortunately, agents offer some hope.
-->

---
clicks: 3
---

# But how do we know it's correct?

<div class="grid grid-cols-[250px_1fr] gap-10 mt-2">
<div class="points">

<p class="lede">Agents judge correctness by running tests on <em>fixed</em> inputs and evaluate on <em>fixed</em> outputs.</p>

<p class="lede" v-click="2"><em>Asynchronous</em> bugs, like data races, appear non-deterministically.</p>

<p class="lede" v-click="2">New hardware's support for new floating point standards may make a correct kernel look incorrect.</p>

<p class="lede" v-click="3">Agents optimising against tests can learn to <em>overfit</em> them.</p>

</div>

<TestsPassRace :step="$clicks" />

</div>

<!--
Go through slide

So the question behind this work is simple: can we give agents tools that prove properties, not just test them?
-->

---
layout: center
---

<h2 class="claim">Glueball gives LLM agents <span class="grad-text">theorem&#8209;proving tools</span> during GPU kernel generation.</h2>

<ProverTools />

<!--
[2:00 · Part 2 — The technique]

Glueball is the first system that gives LLM agents theorem-proving tools while they generate and optimise GPU kernels. We target Gluon, a language just below Triton that exposes the hardware controls you need, like the TMA and Tensor Cores, while keeping a structured form we can formally reason about. And yes: a glueball is what you get when you put enough gluons together.

[cards appear automatically] The agent gets two such tools, both built on the Z3 theorem prover.

The first, symbolic execution, turns the kernel's code into maths, to check it computes the right values.

The second, a model of the asynchronous hardware, turns copies, barriers and memory accesses into events, to check they are safely ordered.

I'll show each in turn, after the overall loop.
-->

---

# The optimisation & verification loop

<p class="lede">Start from an existing Triton model. Each constituent kernel is iteratively optimised and checked for correctness.</p>

<GlueballLoop class="mt-4" />

<!--
[the loop builds itself box by box when the slide appears; ~4 s]

We start from an existing Triton model and translate each kernel mechanically into Gluon.

Then the agents go round a loop. They profile the whole model to find where time goes. They propose a ranked list of optimisations, implement them step by step, and verify each step.

Only then do they benchmark the full model, on input shapes they have never seen.

Anything that fails verification goes back to the agent with the reason.
-->

---
clicks: 1
---

# Verification via Symbolic Execution

<FormulaBuild :step="$clicks" />

<!--
We turn the kernel's code into equations.

Agents can more quickly and easily use this to compare whether two kernels are mathematically equivalent.
-->

---
clicks: 3
---

# Verification via a Formal Hardware Model

<p class="lede">Our Gluon-to-Z3 library models asynchronous copies, memory barriers/fences and asynchronous MMA as <em>events in logical time</em>.</p>

<VerifyFigure :step="$clicks" />

<!--
The Formal Hardware Models helps agents deal with the complexities of modern hardware.

An agent uses our Gluon-to-Z3 library to map code into a Z3 model, and can then ask questions.

In this example, is there a race between copying to buffer 0 and reading from that same buffer.

The agent then runs the theorem prover, that shows an ordering such that that predicate is satisfied, indicating a bug.

Fixing the issue, shows UNSAT, so no race.
-->

---

# Glueball improves bug detection

<BugCharts />

<!--
Cutting false positives allows for aggressive optimizations.
-->

---

# Formal tools reduce token usage

<AblationBars />

<!--
40% fewer tokens to find the bugs: 0.93 million instead of 1.52 million.
-->

---

# Precise verification unlocks optimisations

<p class="lede">Median end-to-end speed-up over human-expert Triton baseline on held-out input shapes.</p>

<SpeedupBars class="mt-2" />

<!--
We are able to improve performance, automatically, without human intervention, on whole models by 7--8%.

This shows that we can optimize for newer architectures much more easily with agentic systems, which was a major blocker for new ML accelerator companies in the past, so called CUDA moat.

Gains on standalone kernels is even larger.
-->

---
clicks: 1
---

# Automating ML systems development

<PhdSpectrum :step="$clicks" />

<!--
Glueball is the first step of my PhD, which is about automating machine-learning systems development across the whole software–hardware stack.

Further down the stack, ...

With performance prediction, such AI-accelerated tooling will become part of standard R&D tools, it means many more companies & labs could produce breakthroughs
-->

---
layout: end
---

# Glueball

<p class="end-sub">Thank you for listening.</p>

<!--
One last thing about the name. In physics, glueballs are predicted by theory but have never been conclusively observed. Verified, agent-written GPU code is in a similar place: we can see it's possible, and the work now is to actually build it.

Thank you.
-->
