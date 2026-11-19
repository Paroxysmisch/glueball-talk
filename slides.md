---
theme: ./slidev-theme
title: Glueball
info: |
  Glueball: Agentic Generation and Verification of Hardware-Optimized Gluon Kernels.
  Yash Shah · University of Cambridge
transition: morph
colorSchema: light
mdc: true
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
clicks: 1
---

# ML Accelerators are becoming complex

<p class="lede">Modern Hopper and Blackwell GPUs rely on <em>overlapping</em> work to maximise hardware utilization.</p>

<AsyncTimeline :step="$clicks" class="mt-6" />

<!--
Modern GPUs like Hopper and Blackwell don't just run more threads. They overlap work.

[click — the whole pipeline plays out] A dedicated copy engine, the TMA, moves data in the background. Groups of threads specialise: some fetch data, others compute. Barriers coordinate them: the dotted lines are the data dependencies.

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

<CompilerStack class="mt-12" />

<div class="gluon-notes">
  <span>Explicit Layouts</span><span>Tensor Descriptors</span><span>TMA</span><span>Tensor Cores</span><span>Warp Specialisation</span>
</div>

<!--
[2:00 · Part 2 — The technique]

Glueball is the first system that gives LLM agents theorem-proving tools while they generate and optimise GPU kernels.

We target Gluon, a language that sits just below Triton. It exposes the hardware controls you need, such as explicit memory layouts and tensor descriptors, TMA — the Tensor Memory Accelerator — and Tensor Cores. It also keeps a structured, tile-level form that we can more easily formally reason about.

[click] And yes: a glueball is what you get when you put enough gluons together.
-->

---
clicks: 1
---

# The loop

<p class="lede">Start from an existing Triton model. Every step is verified before the full model is benchmarked.</p>

<GlueballLoop :step="$clicks" class="mt-4" />

<!--
[click — the loop builds itself box by box; ~9 s]

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
For hardware behaviour, we built a Gluon-to-Z3 library. It models copies, barriers and memory accesses as events in time, with rules about what must happen before what.

[click] The agent then asks Z3 to find a way to break a property, like "no two operations race on the same buffer".

[click] If Z3 can't, that is a proof.

[click] If it can, we get a concrete counterexample, which we replay on the real GPU.
-->

---

# Glueball improves bug detection

<p class="lede">Same LLM, with and without Glueball's correctness pipeline. A bug only counts if the agent also names its failure mechanism.</p>

<table class="bugs">
<thead>
<tr><th rowspan="2">Model</th><th colspan="4" class="grp">Generic suite · 24 bugs, 26 controls</th><th colspan="4" class="grp">Sync suite · 10 bugs, 12 controls</th></tr>
<tr><th>Found</th><th class="d">Δ</th><th>False pos.</th><th class="d">Δ</th><th>Found</th><th class="d">Δ</th><th>False pos.</th><th class="d">Δ</th></tr>
</thead>
<tbody>
<tr><td>DeepSeek V4 Pro</td><td>21</td><td class="d pos">+3</td><td>0</td><td class="d">0</td><td>10</td><td class="d">0</td><td>7</td><td class="d pos">−5</td></tr>
<tr><td>DeepSeek V4 Flash</td><td>22</td><td class="d pos">+2</td><td>0</td><td class="d">0</td><td>10</td><td class="d">0</td><td>1</td><td class="d pos">−1</td></tr>
<tr><td>Meta Muse Spark 1.3</td><td>22</td><td class="d pos">+2</td><td>0</td><td class="d">0</td><td>9</td><td class="d">0</td><td>3</td><td class="d pos">−3</td></tr>
<tr><td>GPT 5.6 Sol</td><td>21</td><td class="d pos">+2</td><td>0</td><td class="d">0</td><td>9</td><td class="d pos">+1</td><td>1</td><td class="d pos">−1</td></tr>
</tbody>
</table>

<!--
[4:00 · Part 3 — Results]

We asked two questions. First: does verification help agents find bugs? Yes.

Across four different LLMs, Glueball detected two to three more of the 24 injected bugs, with zero false alarms.

On a harder suite of synchronisation bugs, it cut false alarms, from seven to two for the strongest model.
-->

---
clicks: 1
---

# Formal tools reduce token usage

<AblationBars :step="$clicks" />

<!--
We also switched the two tools on and off. With both tools, the agent needs about 40% fewer tokens to find the bugs: 0.93 million instead of 1.52 million.

[click] And without either tool, the raw model raises seven false alarms on 21 bug-free kernels. With either tool, that drops to zero.
-->

---

# And the code is still fast

<p class="lede">Median end-to-end speed-up over Triton on held-out input shapes (best of four agents).</p>

<SpeedupBars class="mt-2" />

<Footnote n="">NVIDIA DGX Spark (GB10) · 6 optimisation rounds · models measured end to end, standalone kernels from Liger Kernels.</Footnote>

<!--
Second: is the verified code still fast?

Measured end to end on whole models, it is competitive with already well-tuned Triton, and up to about 7% faster.

The agents found real hardware wins, such as routing MoE experts through the TMA's gather operation.

On neighbourhood attention they changed the algorithm itself, which gives about 24 times.

Mamba-2 only matched Triton: Triton's schedule there is already very good.
-->

---
clicks: 4
---

# Direction 1 · Many GPUs, many chips

<div class="grid grid-cols-[260px_1fr] gap-10 mt-4 items-center">
<div class="points">

<p>Real training and inference run across many GPUs, and increasingly across <strong>different accelerators</strong>.</p>

<div v-click="3">

- collectives in the wrong order
- deadlocks across devices
- communication / compute races

</div>

<p v-click="4" class="punch">The bugs tests catch least, and proofs catch best.</p>

</div>

<MultiGpu :step="$clicks" />

</div>

<!--
[5:00 · Part 4 — Future work and impact]

The first direction is scale.

[click] Real training and inference run across many GPUs, and increasingly across different accelerators.

[click] That adds new ways to fail:

[click] collectives in the wrong order, deadlocks across devices, races between communication and compute.

[click] These are exactly the bugs that tests catch least and proofs catch best.
-->

---
clicks: 3
---

# Direction 2 · Search that knows the rules

<div class="grid grid-cols-[250px_1fr] gap-10 mt-4">
<div class="points">

<p><strong>Lesson from Mamba-2:</strong> agents tried many <em>valid</em> pipeline schedules, but the extra buffering usually cost more than it saved.</p>

<p v-click="1">Apply <strong>resource</strong> and <strong>safety</strong> constraints <em>before</em> generating any code…</p>

<p v-click="3">…then rank what's left using earlier rounds. Fewer expensive LLM iterations.</p>

</div>
<div>

<ScheduleGrid :step="$clicks" />

</div>
</div>

<Footnote n="">Illustrative schedule space: stage count × tile/warp configuration.</Footnote>

<!--
The second direction comes from Mamba-2. There, agents tried many valid pipeline schedules, but the extra buffering usually cost more than it saved.

[click] We can apply resource
[click] and safety constraints before generating any code.

[click] Combined with what we learned from earlier rounds, that prunes the search space and saves expensive LLM iterations.
-->

---
clicks: 3
---

# Direction 3 · Verify the whole stack

<div class="grid grid-cols-[250px_1fr] gap-10 mt-4 items-center">
<div class="points">

<p>Today we verify at the <strong>Gluon</strong> level.</p>

<p v-click="1">But bugs can be introduced at <strong>every step</strong> of compilation.</p>

<p v-click="2">With a formal model of PTX and other tools, verify at several levels…</p>

<p v-click="3" class="punch">…guarantees much closer to what actually runs on the hardware.</p>

</div>

<StackDescent :step="$clicks" />

</div>

<!--
The third direction goes down. Today we verify at the Gluon level.

[click] But bugs can be introduced at every step of compilation.

[click] With a formal model of PTX and other tools, we could verify at several levels

[click] and get guarantees much closer to what actually runs on the hardware.
-->

---
clicks: 2
---

# The PhD · Automating ML systems development

<PhdSpectrum :step="$clicks" />

<!--
[7:00 · Part 5 — PhD and close]

Glueball is the first step of my PhD, which is about automating machine-learning systems development across the whole software–hardware stack.

On the kernel side, the next step is inequivalence checking: adversarial agents search for inputs where an optimised kernel and its reference disagree, and only mismatches reproduced on real hardware are trusted.

[click] Further down the stack, agents that build compilers for new accelerators, and learned models that predict a hardware design's speed, power and area, all working towards automated software–hardware co-design.

[click] This year: the inequivalence-checking paper. Then agent-built compilers, aiming for ICLR 2028, and performance modelling, aiming for MLSys 2029.
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
