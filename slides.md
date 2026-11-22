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

<p class="sources">Sources: Epoch AI, <em>How many AI models will exceed compute thresholds?</em> (2025) · Goldman Sachs Research, <em>Decoding the Agentic Economy</em> (May 2026), as reported by Goldman Sachs Insights and I/O Fund (2026).</p>

<!--
Model capability has largely been driven by scaling laws, and demand for compute is growing on two fronts.

[left] Training. Today there are essentially no models trained with more than 10^27 FLOPs. By 2030, Epoch expects over a hundred.

[right] And inference, actually using these models, is growing even faster. Goldman Sachs estimates the world processed about 1.7 quadrillion tokens a month in mid-2025. They forecast about 120 quadrillion a month by 2030, roughly 70 times more, mostly because of agents. An agent doesn't answer one question; it runs a long loop of model calls, reading files, calling tools, thinking. And this is on a linear scale: we are only at the very start of that curve.

For context, Google alone went from about 10 trillion tokens a month in 2024 to 3.2 quadrillion in May 2026.

(Data: Epoch >10^27 counts decoded from their cumulative chart: 0 / 6 / 25 / 64 / 124 by the start of 2026–2030. Goldman Sachs tokens/month: ~1.7Q mid-2025 and ~5.6Q May 2026 (estimates), ~47Q in 2028 and ~120Q mid-2030 (forecast, "24× from 2026"); published points joined by straight lines. Google: 9.7T Apr 2024, 3.2Q May 2026, Sundar Pichai at I/O 2025 / 2026.)
-->

---

# Power alone can't close the gap

<PowerWall class="mt-2" />

<p class="sources">Sources: IEA, <em>Key Questions on Energy and AI</em> (2026) · Sightline Climate (2026) · NVIDIA DGX / GB200 / GB300 / Vera Rubin specifications · Uptime Institute, <em>Global Data Center Survey</em> (2025).</p>

<!--
The obvious answer is to just build more data centres and plug in more power. That runs into two walls.

[left] First, power infrastructure is slow. According to the IEA, a grid connection takes five to ten years in many places, a new transmission line four to eight, a gas turbine about five years to be delivered, and even a transformer two to three. Meanwhile NVIDIA ships a new GPU generation every year. Already, 30 to 50% of the large data-centre projects planned for 2026 are expected to be delayed, mostly by power.

[right] Second, density. You can't just pack more chips into the same building. A rack of A100s drew about 26 kilowatts. A GB200 rack draws 120, Vera Rubin about 190, and NVIDIA's announced Rubin Ultra rack 600 kilowatts, the power of a small neighbourhood in the space of a fridge. Air cooling stops working at around 50 kilowatts, so every rack since Blackwell needs liquid cooling, new power delivery, new buildings. The average data-centre rack today is about 9 kilowatts.

(Data: lead times from IEA Key Questions §1.3 (transformers 2–3 yrs, gas turbines ~5 yrs per Wood Mackenzie, grid connection 5–10 yrs; transmission 4–8 yrs). Delays: Sightline Climate (Feb 2026). Racks: 4× DGX A100 at 6.5 kW; 4× DGX H100 40.8 kW (SuperPOD guide); GB200 NVL72 120 kW, GB300 NVL72 135 kW (Mission Control); Vera Rubin NVL72 187 kW Max-Q / 227 kW Max-P; Rubin Ultra NVL576 ~600 kW (GTC 2025). Air cooling impractical >~50 kW/rack, average ~9 kW: Uptime Institute.)
-->

---

# Architecture must deliver the rest

<ComputeSources class="mt-2" />

<p class="sources">Sources: AI 2027, <em>Compute Forecast</em> (2025) · IEA, <em>Key Questions on Energy and AI</em> (2026) · TSMC Technology Symposium roadmaps (2025, 2026).</p>

<!--
So let's put it together. AI compute demand grows about 130 times by 2030.

Even if AI data centres grow their power 4.5 times, which is what the IEA expects, and we follow the best TSMC process roadmap for about 2.3 times, that's only about 10 times combined.

The remaining 13 times, more than power and process node combined, has to come from architecture: specialised arithmetic units, lower precision, asynchronous data movement.

However, more complex hardware means the software we have to write to get the most out of it also becomes more complicated.

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
<li><strong>The best schedule differs per kernel</strong>; fixed heuristics miss it</li>
<li><strong>Even Triton</strong> added Gluon as a hand-tuning escape hatch</li>
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

First, every generation adds new hardware: the TMA copy engine, asynchronous tensor-core instructions, Blackwell's tensor memory. Each one needs new compiler passes and cost models written by hand, which takes years.

Second, there is no single right answer. How to split a kernel into producer and consumer warps, how many pipeline stages, which memory layout: the best choice depends on the structure of each kernel, so fixed rules and autotuning leave performance on the table.

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
The idea is that the agent can map code into a hardware model via our Gluon-to-Z3 library. It can then use this hardware event model to prove properties.

E.g. in this case is there a race between the copy into buffer 0 and the reading of buffer 0.

A theorem prover then tries to satisfy this predicate.

Here, the code is buggy, and the prover finds an schedule of events that satisfies this.

Fixing the kernel makes it unsatisfiable.
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

# Formal tools reduce token usage

<AblationBars />

<!--
We also switched the two tools on and off. With both tools, the agent needs about 40% fewer tokens to find the bugs: 0.93 million instead of 1.52 million.
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

<div v-motion :initial="{ opacity: 0, y: 10 }" :enter="{ opacity: 1, y: 0, transition: { delay: 150, duration: 500 } }">

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
