# Glueball — talk

Slidev deck for *Glueball: Agentic Generation and Verification of Hardware-Optimized Gluon Kernels*,
using the Aurora theme (`./slidev-theme`, cloned from git@github.com:Paroxysmisch/slidev-theme.git).

```bash
bun install          # or npm install
bun run dev          # http://localhost:3030, presenter view at /presenter (script is in the notes)
bun run export       # PDF (needs playwright-chromium, already a devDependency)
bun run export:clicks  # glueball-with-clicks.pdf: one page per click step, compressed with Ghostscript (~10 MB)
```

- `slides.md` — 19 slides; the full spoken script lives in each slide's presenter notes.
- `components/` — the animated figures (all driven by `$clicks`).
- `style.css` — deck-specific helpers on top of the theme.
- PhD theme / year-one milestone / longer-term goal are placeholders on slide 15 (`.ph` boxes).
