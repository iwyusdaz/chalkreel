# Agent review — chalkreel

- **Review type:** Agent review (independent, fresh context — the reviewing
  agent did not build the repository)
- **Same-model limitation (disclosed):** this review was performed by a GLM
  model — the same model family that assisted in building the repository. It
  is **heuristic review by a model, not human or expert feedback**, and not a
  multi-model review panel. It should be read as one more labeled artifact in
  the paper trail, not as independent validation.
- **Date:** 2026-10-31
- **Scope:** honesty audit, licensing boundary (anything2explainer /
  humanizer), full test run, TypeScript compile check, SKILL.md coherence,
  script edge cases, repo hygiene, docs accessibility spot-check.
- **Outcome:** overall the repository is in good shape. Three script bugs and
  one packaging inconsistency were found and fixed in this review; several
  findings are recorded as open.

---

## 1. Honesty audit — PASS

- The 12-second render (`docs/assets/sample-segment-demo.mp4`) is described
  in `docs/index.html` and `docs/paper-trail/08-qc-report.md` as a **silent,
  constructed example** with an explicit "do not judge the content from it"
  caveat. No full video is claimed anywhere.
- Constructed timing JSON: both `skill/examples/sample-timing.json` and
  `docs/paper-trail/05-timing.json` carry an in-file `note` field stating the
  word timings were **synthesized, not output from a real TTS run**. The
  generated transcript page surfaces the same note visibly.
- No learner or expert claims found anywhere (README, SKILL.md, docs site,
  QC report, METHODS.md all state the opposite explicitly). The QC report
  labels every review "Agent heuristic review (build agent, same model as
  author — disclosed limitation)". METHODS.md maintains a clean
  completed/pending split and forbids citing pending work.
- AI-disclosure present: README "Tools used" and the docs-site footer state
  the project was built with AI assistance.

**Finding H1 (low, fixed in this review):** the QC report and docs site said
the sample MP4 and stills were "committed for review" / linked as repo
assets, but the MP4 was excluded by the `*.mp4` ignore rule and therefore
absent from the repository — a link that 404s for any visitor. Fixed by
committing the 1.2 MB sample with a `.gitignore` exception for
`docs/assets/sample-segment-demo.mp4` (see fix F4).

## 2. Licensing boundary (CRITICAL check) — PASS

- `ATTRIBUTION.md` names Vincentwei1021/anything2explainer with its **PolyForm
  Noncommercial** license and states the boundary explicitly ("nothing was
  copied — not code, not configuration, not prose"), and lists what was taken
  as method only. `skill/SKILL.md` and `docs/index.html` repeat the boundary.
- Grep of the full working tree for anything2explainer's distinctive
  identifiers and config names (`builtBy`, `bg: dots/stars`, its TTS voices
  `zh-CN-YunxiNeural` / `am_liam`, its scripts `tts_build.py`,
  `frame_metrics.py`, `render_storyboard.py`, its 9-stage names, and its
  signature README phrases such as "Topic in, narrated explainer video out",
  "You are consulted at exactly four checkpoints", "white line art", "purple
  accents", "hard-coded into every shot"): **no matches**. The Remotion
  template uses its own component/scene naming (`ChalkreelVideo`,
  `SceneRouter`, `CycleScene`, ...), unrelated to anything2explainer's
  `src/shots/G1..Gn` structure. chalkreel's tagline is a deliberate
  transformation of the credited project's ("Learning objective in, ... out"
  vs "Topic in, ... out"), which is a *contrast*, not a copy.
- Pipeline shape differs: 7 stages with a script-enforced objective gate,
  accessibility stage, and Mayer QC — no stage-name or file overlap with the
  credited project's 9 stages.
- Humanizer check: `skill/scripts/lint-narration.mjs` was compared against
  blader/humanizer's documented 26-pattern list (MIT, derived from
  Wikipedia's "Signs of AI writing"). The chalkreel rule set is an
  independent implementation: different rule names, different structure
  (error/warn severity + per-1000-word density caps vs humanizer's numbered
  Problem/Before/After patterns), and none of humanizer's distinctive
  content ("weak alone" annotations, "act on one sighting", the
  invented-character examples, the 2022-11-30 cutoff line, the
  gate/quietly-specific word list) appears. The overlapping lexicon
  (delve, tapestry, testament, showcase, ...) is the vocabulary both draw
  from Wikipedia's public page. Both sources are credited in the script
  header, ATTRIBUTION.md, SKILL.md and README. No code lifted.
- Attribution coverage is complete: anything2explainer, vox-director,
  humanizer, Wikipedia — each with license stated.

## 3. Test suite (run by this reviewer) — PASS

`npm test` exit 0. Actual results:

| Check | Result |
|---|---|
| `objective-gate.mjs` on ABCD objective | PASS (A/B/C/D all found) |
| `lint-narration.mjs` on good narration | PASS — 250 words, 0 errors / 0 warnings |
| `make-srt.mjs` on sample timing | wrote 41 cues |
| `make-transcript.mjs` | wrote 6 segments |
| `a11y-lint.mjs` on sample storyboard | PASS — 6 segments, 3 fact tokens, 0 audio-only, 3 advisories (missing claim ids on seg-01/02/06) |

Negative tests, run manually with real exit codes:

- `lint-narration.mjs bad-narration.txt` → **29 errors / 6 warnings, exit 1**
  (delve, testament to, realm, harness, seamless, ever-evolving, game-
  changing, not-just-but frame, emoji, markdown in VO, sycophantic close,
  rhetorical opener, etc. all tripped).
- `a11y-lint.mjs bad-storyboard.json` → **10 violations, exit 1** (no
  on-screen text x2, audio-only facts 2006/50 percent/2017, missing AD notes
  x2, overlapping segment timings, `srtEmitted`/`transcriptEmitted` false).
- `objective-gate.mjs "A video about photosynthesis"` → FAIL, exit 1; also
  rejects "Students will understand photosynthesis" (unmeasurable verb).

README's claimed counts (29 / 10 / 41 cues / 250 words) all reproduce.

## 4. Template compile check — PASS

`cd template && npx tsc --noEmit` → exit 0, no output.

## 5. SKILL.md coherence — PASS with one open observation

- The 7 pipeline stages (objective gate → research → narration → bake-off →
  build → accessibility → QC) and 4 gates map 1:1 onto the 5 scripts that
  exist, and the scripts table documents exact CLI invocations matching the
  actual argument parsers (verified against the source).
- Segment budgets (10–30 s hard cap, ~145 words/60 s, 2–7 word on-screen
  text), TTS defaults (kokoro-82m, `af_heart`, speed 1.0, word timestamps,
  never guess timings), and QC criteria (12 numbered pass/fail criteria with
  blocking rules) are concrete enough for another agent to execute.
- File-format specs match what the scripts actually parse (spot-checked all
  required fields).

**Finding S1 (low, open):** the SKILL.md pipeline has no scripted check for
step 2 (research/claims ledger) or the reading-level check of step 3 — both
are prose instructions only. Acceptable (they are judgment tasks), but a
future `claims-lint.mjs` cross-referencing narration numbers against the
ledger would close the gap the a11y-lint advisories hint at.

## 6. Script edge cases — 3 bugs found and fixed

Probing beyond the fixtures (empty segments, missing fields, unicode,
overlapping segments) found real defects:

- **F1 / make-srt overlap bug (medium, FIXED).** The "Enforce monotonic,
  non-overlapping cues" pass used
  `cues[i-1].end = Math.max(cues[i].start, cues[i-1].end - 0.01)`, which
  *keeps* the overlap whenever the previous cue ends more than 10 ms after
  the next cue starts. The committed `docs/paper-trail/06-subtitles.srt`
  actually contained 6 overlapping cue pairs (e.g. a cue `18,300 → 20,802`
  overlapped by a later-starting cue `18,412 → 18,901`). Fixed to
  `Math.min(prev.end, next.start)` (safe because cues are sorted by start);
  the paper-trail SRT was regenerated (still 41 cues; starts unchanged, six
  end times trimmed). Fixture counts and README claims are unaffected.
- **F2 / make-srt missing `end` field (low, FIXED).** Word entries were
  validated for `w` and `start` but not `end`; a missing `end` slipped
  through and produced `NaN:NaN:NaN,NaN` timestamps in the SRT with exit 0.
  Validation now requires `end` to be a number (exit 2 with a clear message).
- **F3 / make-srt millisecond rounding (low, FIXED).** `Math.round` on the
  fractional second could yield `1000` ms (e.g. t = 0.9999999 →
  `00:00:00,1000`, invalid SRT). `fmt` now quantizes once at ms precision,
  making the field impossible to overflow.
- **F5 / a11y-lint dead code (low, FIXED).** In `extractFacts`, a block
  guarded by `if (i === 0 && ...)` sat **inside** a loop that starts at
  `i = 1` — unreachable, so its documented purpose (catching a capitalized
  word right after a sentence-initial name) never ran. Relocated before the
  loop; no fixture output changed.
- **Finding A1 (medium, OPEN — a11y-lint false negatives on co-named
  entities).** The main name-extraction rule rejects a capitalized word when
  the *previous* word is a stopword, so names in "Roediger and Karpicke" or
  "Bjork and Bjork" are never extracted as fact tokens (verified: a
  storyboard whose narration names both researchers but omits them on screen
  passes with `factsChecked: 1` — only the year is checked). A lint that
  misses facts weakens the "no info in audio alone" guarantee. Left open
  because removing the previous-word condition changes extraction behavior
  and the documented fact counts; it deserves its own change with re-run
  fixtures and a README count update.

Also verified: empty/missing `segments` and malformed words fail loudly
(exit 2) in all three JSON-consuming scripts; make-transcript HTML-escapes
all interpolated values (`esc`) and emits `lang`, one `h1`, `<time>`; the
SRT unicode pass-through is correct (accented words survive verbatim).

## 7. Repo hygiene — PASS with one fix

- `LICENSE`: MIT, present. `package.json` license field consistent.
- `.gitignore`: ignores `node_modules/`, render output (`template/out/`,
  `*.mp4` etc.), bundler caches. Render outputs are not tracked (verified:
  `template/build/`, `template/node_modules/` untracked).
- **gitleaks:** history scan of 7 commits → **no leaks**. Working-tree scan
  flags one `algolia-api-key` match inside `template/build/533.bundle.js` —
  that file is a local, *untracked* Remotion webpack bundle (the key is
  Remotion's own public docs search key, not a repo secret). Not a finding
  against the repository contents.
- No tracked file anywhere near 50 MB (largest tracked assets are three
  ~690 KB PNGs; the newly committed MP4 is 1.2 MB).
- Commit history is meaningful and conventional-commit styled.

**Fixed in this review (F4):** `docs/assets/sample-segment-demo.mp4` (1.2 MB,
the referenced 12 s silent sample) was excluded by the blanket `*.mp4` rule;
committed with a targeted `.gitignore` exception so the docs-site and QC
report references resolve.

## 8. Docs accessibility spot-check — PASS

`docs/index.html`: `lang="en"`, single `h1`, logical h1→h2 order, `alt` text
on every image (descriptive, not decorative filler), descriptive link text,
`<main>` landmark, contrast-safe palette (#1b1b1b on #ffffff body, #0b45a0
links ≈ 7.7:1), max-width reflow with viewport meta, no motion/animation
CSS.

Generated `docs/transcript.html` (from `make-transcript.mjs`): `lang`, one
`h1`, `h2` per segment with `<time datetime>`, `<main>` landmark, visible
constructed-example notice, escaped content. No keyboard traps possible
(no JS at all — both pages are pure static HTML, which is the strongest
keyboard/accessibility story available).

## Verdict

The repo does what it claims: the negative tests genuinely fail, the
compile check passes, the licensing boundary around PolyForm-licensed work
is respected and well documented, and the honesty labeling is consistent
across every artifact. The three make-srt bugs and the a11y-lint dead code
were real but small; the one substantive open finding is A1 (fact extraction
misses names joined by stopwords). No learner/expert/effectiveness claims
exist anywhere to walk back.

*Review method: manual source reading, adversarial fixture probing, and
re-running of all documented commands by the reviewing agent; same-model
limitation as disclosed above.*
