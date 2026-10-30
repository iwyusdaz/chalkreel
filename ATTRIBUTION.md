# Attribution and license boundaries

chalkreel is original work, MIT-licensed. Three projects informed its **method**
at the idea level. No code, files, templates, or text were copied from any of
them; everything in this repository was written from scratch for chalkreel.

## Vincentwei1021/anything2explainer — method inspiration only

- Source: https://github.com/Vincentwei1021/anything2explainer
- License: **PolyForm Noncommercial.** This license prohibits copying its code
  into this (permissively licensed) repository, so **nothing was copied** —
  not code, not configuration, not prose.
- What we took as *method* (concepts, credit where due):
  - explainer videos built from **code-drawn frames in Remotion** instead of
    generative video models or stock footage;
  - a **research → narration → storyboard → shot → QC paper trail**;
  - **word-boundary-aligned subtitles** from TTS timing;
  - **parallel per-shot build agents** and **QC agents that judge rendered
    frames against written criteria**.
- How chalkreel differs: objective-first input (ABCD gate), Mayer-principle QC
  criteria in writing, accessibility deliverables as first-class outputs,
  sourced-claim traceability, and permissive licensing.

## Alisa0808/vox-director — gate pattern

- Source: https://github.com/Alisa0808/vox-director
- License: MIT.
- What we took: the **gated approval flow** idea (user approves a beat map;
  a style bake-off renders the same beat in several themes and the user picks
  by eye). chalkreel implements its own four-gate flow; no code was used.

## blader/humanizer + Wikipedia "Signs of AI writing" — checklist concept

- Sources: https://github.com/blader/humanizer and
  https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
- What we took: the *idea* of a checklist of AI-writing tells applied to a
  voice-over script before TTS. The specific rule set, regexes, thresholds,
  and output format in `skill/scripts/lint-narration.mjs` are an **independent
  implementation** written for chalkreel; no code or text from either source
  is included.

## Other cited material

- Mayer's multimedia principles and the ABCD objective format are published
  instructional-design concepts; chalkreel references them by name and
  encodes them as written criteria.
- Research citations in the sample paper trail (`docs/paper-trail/`) point to
  published papers (Abbott 1909; Roediger & Karpicke 2006; Adesope et al.
  2017; Bjork & Bjork 2011; Dunlosky et al. 2013; Karpicke & Blunt 2011).
  Brief claim summaries are given with citation; no substantial text is
  reproduced.

## Licensing of this repository

- Code and scripts: MIT (`LICENSE`).
- Sample learning content (paper-trail prose, narration, storyboard):
  MIT as well, as this is a code/tooling repository rather than OER content;
  reuse the sample content freely with attribution.
