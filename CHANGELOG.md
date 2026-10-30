# Changelog

## 1.0.0 — 2026-10-31

Initial public release.

### Added
- `skill/SKILL.md`: the full pipeline — objective gate, sourced research,
  humanized narration, style bake-off, build, accessibility bundle, Mayer-
  criteria QC — with 4 human approval gates, segment budgets, TTS defaults
  (kokoro-82m / BYO), and the written QC criteria pack.
- `skill/scripts/`: five standalone Node scripts (no dependencies):
  `objective-gate.mjs`, `lint-narration.mjs`, `make-srt.mjs`,
  `make-transcript.mjs`, `a11y-lint.mjs`.
- `skill/examples/`: positive and negative fixtures, including the mandatory
  negative tests (bad narration trips 29 errors; bad storyboard fails 10
  a11y checks).
- `template/`: minimal compilable Remotion project — chalkboard backdrop,
  five code-drawn scene kinds, word-aligned caption layer, chapter progress
  bar. Passes `tsc --noEmit`, `remotion bundle`, and renders (12 s sample +
  stills).
- `docs/`: static accessible case-study site with the complete paper trail of
  the sample project ("How retrieval practice works", 6 segments): objective,
  research notes, narration, storyboard, constructed-example timings,
  generated SRT, claims ledger, QC report (including one real FAIL→fix cycle),
  and a generated accessible transcript page.

### Known pending
- No TTS voice recorded in this run: no full-length video with audio; the
  12-second sample render is silent and labeled as a constructed example.
- Word-alignment audio spot-check (10 cues) awaits the TTS run.
- No expert panel or learner testing; none claimed.
