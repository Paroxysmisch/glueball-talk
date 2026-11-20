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
[0:00 · Part 1 — Motivation]

Hi, I'm Yash. This talk is about Glueball: getting AI agents to write fast GPU code, and to prove that code is correct.
-->

---

# Compute is outrunning the transistor

<ComputeGap />

<p class="sources">Sources: Epoch AI, <em>How many AI models will exceed compute thresholds?</em> (2025) · AI 2027, <em>Compute Forecast</em> (Dean, 2025) · TSMC A14 announcement (Apr 2025) · Shah et al., <em>FlashAttention-3</em> (2024).</p>

<!--
[the charts animate in when the slide appears]

Training compute is what has driven AI progress, and it keeps growing. Epoch AI's projections: today there are essentially no models trained with more than 10^27 FLOP. By 2030, in their median scenario, there will be over a hundred.

So where does all that compute come from? Look at how it's been growing. The AI 2027 compute forecast has the world's AI compute growing about 25-fold from 2023 to 2027, but AI datacentre power growing 12-fold alongside it, to 62 gigawatts. Compute per watt only doubles. We're mostly buying compute with more chips and more power, and that can't keep going.

And process nodes won't save us: TSMC's A14, in production in 2028, is at most 15% faster than N2 at the same power. The rest has to come from architecture: specialised units, lower precision, asynchronous data movement.

That's the catch. Every new hardware feature makes the software harder to write. When Hopper launched, FlashAttention-2 reached only 35% of its peak; it took about two years for FlashAttention-3 to reach 75%.

(Data: Epoch median counts, decoded from their cumulative chart: >10^27 FLOP models 0 / 6 / 25 / 64 / 124 by the start of 2026–2030. AI 2027 Section 1 table, end of year 2023–2027: AI compute 4 / 8.5 / 18 / 40 / 100 M H100e; AI datacentre power 5 / 9 / 15 / 29 / 62 GW; so ×25 compute, ×12.4 power, ×2.0 compute per watt. AI 2027 labels this section "uncertain but informed".)
-->

---

# ML Accelerators are becoming complex

<p class="lede">Modern Hopper and Blackwell GPUs rely on <em>overlapping</em> work to maximise hardware utilization.</p>

<AsyncTimeline class="mt-6" />

<!--
Modern GPUs like Hopper and Blackwell don't just run more threads. They overlap work.

[plays automatically when the slide appears] A dedicated copy engine, the TMA, moves data in the background. Groups of threads specialise: some fetch data, others compute. Barriers coordinate them: the dotted lines are the data dependencies.

That is where the speed comes from now. It is also where the difficulty comes from. A fast kernel is a choreography of copies, computation and synchronisation across several pipeline stages. The right choreography differs for every kernel.
-->

---

# Agents are good at this search

<div class="grid grid-cols-[1fr_330px] gap-12 items-center mt-4">
<div>

<p class="lede">Compilers are struggling to keep up with specialised hardware that changes every generation.</p>

<p> Humans cannot manually optimise every kernel.</p>

<v-clicks>

- **Understand** novel hardware intricacies
- **Adapt** expert patterns to new kernels
- **Explore** novel designs by combining optimisations
- **Refine** them using profiler feedback

</v-clicks>

</div>

<AgentLoop />

</div>

<!--
Fixed compiler rules struggle to keep up with hardware that changes every generation. LLM agents are a promising alternative.

[click] They can adapt expert patterns to each kernel,
[click] try different designs,
[click] and refine them using profiler feedback.

[click] Benchmarks like KernelBench and TritonBench have made this an active research area.
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
Here's the catch. Today, these agents judge correctness by running tests. Tests check particular inputs on a particular run.

[click — zoom into one run] 

[click — overlap turns red] Concurrency bugs, such as data races or a missing barrier, depend on timing. A kernel can pass every test and still be wrong.

[click] Worse, an agent that is optimising against tests can learn to overfit them.

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

# The loop

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
Verification is the core idea.

[click] Where the maths is simple enough, we turn the kernel's code into equations. Here, Triton's softmax kernel: each line of the compiled code becomes one piece of a single formula, which the Z3 solver can then check against the reference.
-->

---
clicks: 3
---

# Verification via a Formal Hardware Model

<p class="lede">Our Gluon-to-Z3 library models asynchronous copies, memory barriers/fences and asynchronous MMA as <em>events in logical time</em>.</p>

<VerifyFigure :step="$clicks" />

<!--
For hardware behaviour, we built a Gluon-to-Z3 library. Here's a real example: a two-buffer pipeline. It starts copying tile 0 into buffer 0; then, in the loop, it prefetches the next tile into buffer 1, waits, and reads buffer 0.

[click] The agent turns each of these operations into an event for Z3, with the rules about what must happen before what. The read comes after the wait. But this wait only blocks while more than two copies are in flight, so nothing orders it after either copy finishing. The agent asks Z3: can the read come before copy 0 is done?

[click] Z3 says yes, and gives a concrete ordering. Play it: both copies start, the wait returns straight away, the read of buffer 0 happens while copy 0 is still writing it, and only then does copy 0 finish. The agent replays this on the real GPU to confirm the race. Whether it actually breaks depends on timing, so tests can easily miss it.

[click] The fix is one character: wait until at most one copy is in flight. Now copy 0 must finish before the wait returns, and Z3 finds no such ordering. That is a proof there is no race.
-->

---

# Glueball improves bug detection

<BugCharts />

<!--
[4:00 · Part 3 — Results]

We asked two questions. First: does verification help agents find bugs? Yes.

Across four different LLMs, Glueball detected two to three more of the 24 injected bugs, with zero false positives.

On a harder suite of synchronisation bugs, it cut false positives, from seven to two for the strongest model.
-->

---
clicks: 1
---

# Formal tools reduce token usage

<AblationBars :step="$clicks" />

<!--
We also switched the two tools on and off. With both tools, the agent needs about 40% fewer tokens to find the bugs: 0.93 million instead of 1.52 million.

[click] And without either tool, the raw model raises seven false positives on 21 bug-free kernels. With either tool, that drops to zero.
-->

---

# Precise verification unlocks optimisations

<p class="lede">Median end-to-end speed-up over human-expert Triton baseline on held-out input shapes (best of four agents).</p>

<SpeedupBars class="mt-2" />

<!--
Second: is the verified code still fast?

Measured end to end on whole models, it is competitive with already well-tuned Triton, and up to about 7% faster.

The agents found real hardware wins, such as routing MoE experts through the TMA's gather operation.

On neighbourhood attention they changed the algorithm itself, which gives about 24 times.

Mamba-2 only matched Triton: Triton's schedule there is already very good.
-->

---

# Direction 1 · Extension to distributed kernels

<div class="grid grid-cols-[260px_1fr] gap-10 mt-4 items-center">
<div class="points">

<p>Real training and inference run across many GPUs, and increasingly across <strong>heterogeneous accelerators</strong>.</p>

<div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0, transition: { delay: 3200, duration: 500 } }">

- mismatched or skipped collectives
- deadlocks across devices
- communication / compute races

</div>

</div>

<MultiGpu />

</div>

<!--
[5:00 · Part 4 — Future work and impact]

[everything plays automatically when the slide appears, ~3.5 s]

The first direction is scale. Real training and inference run across many GPUs, and increasingly across different accelerators.

Take a Mixture-of-Experts layer: every GPU sends its tokens to the experts on other GPUs, and gets results back, through two all-to-all collectives.

Now suppose, for one batch, GPU 2's router sends it no tokens, and its kernel takes an early exit and skips the all-to-all. The other three GPUs wait for it forever. It only happens for some inputs, so tests rarely hit it. That's the kind of failure we get at scale: collectives that don't match up, deadlocks across devices, races between communication and compute.

These are exactly the bugs that tests catch least and proofs catch best.
-->

---
clicks: 3
---

# Direction 2 · Statistics-guided search

<div class="grid grid-cols-[250px_1fr] gap-10 mt-4">
<div class="points">

Search directly via LLM reasoning costs a lot of tokens.

<p v-click="1">Search schedules with <strong>Bayesian optimisation</strong>: the LLM supplies the <strong>prior</strong>, real runs on the GPU inform the <strong>posterior</strong>.</p>

<p v-click="2">The LLM also acts as the <strong>acquisition function</strong>, choosing what to run next.</p>

</div>
<div>

<BoSearch :step="$clicks" />

</div>
</div>

<!--
The second direction comes from Mamba-2. There, agents tried many valid pipeline schedules, but the extra buffering usually cost more than it saved. Blind trial and error is expensive.

Instead, we can treat this as Bayesian optimisation. The LLM's knowledge gives a prior over which execution schedules should be fast, the dashed line, and schedules that fail safety or resource checks are ruled out before anything runs.

[click] Real runs on the GPU give measurements, and the model updates.

[click] The LLM then acts as the acquisition function: it picks the most promising schedule to try next.

[click] We run it, and the model homes in on the best schedule with far fewer expensive iterations.
-->

---
clicks: 1
---

# Automating ML systems development

<PhdSpectrum :step="$clicks" />

<!--
[7:00 · Part 5 — PhD and close]

Glueball is the first step of my PhD, which is about automating machine-learning systems development across the whole software–hardware stack.

On the kernel side, the next step is inequivalence checking: adversarial agents search for inputs where an optimised kernel and its reference disagree, and only mismatches reproduced on real hardware are trusted.

[click] Further down the stack, agents that build compilers for new accelerators, and learned models that predict a hardware design's speed, power and area, all working towards automated software–hardware co-design.
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
