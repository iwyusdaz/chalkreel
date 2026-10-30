# Changelog

## 1.0.1 — 2026-10-31

### Fixed (from the independent agent review, `evaluation/agent-review.md`)
- `make-srt.mjs`: the non-overlap enforcement kept overlaps instead of
  trimming them (`Math.max` vs `Math.min`); the committed paper-trail SRT
  contained 6 overlapping cue pairs. Fixed and
  `docs/paper-trail/06-subtitles.srt` regenerated (still 41 cues, now
  genuinely non-overlapping).
- `make-srt.mjs`: word entries are now validated for a numeric `end` field
  (a missing `end` previously produced `NaN` timestamps with exit 0).
- `make-srt.mjs`: the millisecond field can no longer round up to an
  invalid `1000` (e.g. `00:00:00,1000`).
- `a11y-lint.mjs`: removed an unreachable `i === 0` block inside a loop
  starting at `i = 1`; its check (capitalized word after a sentence-initial
  name) now actually runs.
- Packaged the 12 s silent sample render
  (`docs/assets/sample-segment-demo.mp4`, 1.2 MB) that the docs site and QC
  report reference but that the blanket `*.mp4` ignore rule excluded; added
  a targeted `.gitignore` exception.

### Known open
- `a11y-lint.mjs` fact extraction misses capitalized names preceded by
  stopwords (e.g. "Roediger and Karpicke") — recorded as finding A1 in the
  agent review; fixing it changes documented fact counts, so it is left for
  a dedicated change.

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
