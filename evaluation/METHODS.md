# Evaluation methods — what ran, what is pending

This file records every evaluation method used in this build run, following
the portfolio honesty rules: label everything, separate author and evaluator,
never present pending work as done.

## Completed (2026-10-31)

| Method | Tool / procedure | Result | Labels to use when citing |
|---|---|---|---|
| Automated script checks | `objective-gate.mjs`, `lint-narration.mjs`, `a11y-lint.mjs`, `make-srt.mjs`, `make-transcript.mjs` run on the sample project and on negative fixtures | All positive checks pass; negative fixtures fail as designed (29 lint errors on seeded bad narration; 10 a11y violations on broken storyboard) | "Automated checks" |
| Round-trip verification | Word-coverage and monotonicity checks on generated SRT; completeness checks on generated transcript HTML | 250/250 words covered; 41 monotonic cues; all segments present | "Round-trip check" |
| Compile verification | `tsc --noEmit`, `remotion bundle` in `template/` | Pass | "Compile check" |
| Render verification | `remotion render` (360 frames) + `remotion still` at 5 frames | Pass; assets committed to `docs/assets/` | "Render check" |
| Frame review | Agent heuristic review of rendered stills against the written frame criteria in `skill/SKILL.md` | 1 real FAIL found (timeline line crossing labels), fixed, re-checked PASS | **"Agent heuristic review (build agent)"** — same model as the author; disclosed limitation |
| Independent agent review (fresh context) | Reviewing agent that did not build the repo: honesty audit, licensing-boundary grep vs `anything2explainer`/`humanizer`, full test run, `tsc --noEmit`, script edge-case probing, repo hygiene, docs accessibility spot-check | 3 script bugs + 1 packaging inconsistency found and fixed; 1 open finding (a11y fact extraction misses names joined by stopwords) | **"Agent review (fresh context, same model family)"** — see `evaluation/agent-review.md`; still a model review, not human or multi-model |

## Pending (do not cite as done)

| Method | What is needed | Status |
|---|---|---|
| TTS voiceover (kokoro-82m) for the sample video | A local TTS run; word timestamps replace the constructed example | PENDING — requires TTS run |
| Word-alignment audio spot-check | 10 cues checked against real audio timestamps | PENDING — requires TTS run |
| Full-length render with audio + GATE 4 | Same | PENDING |
| Multi-model agent review panel | ≥2 configured models reviewing the paper trail and QC output | PENDING — the fresh-context review in `evaluation/agent-review.md` is single-model (same family as the build agent); a panel of ≥2 different models still requires API keys (`.env.example` to be added when the pipeline lands) |
| Human educator review of one output video | 2–3 educators, consented protocol | PENDING — protocol to be added under `evaluation/human-protocol/` |
| Manual screen-reader pass on `docs/` by an assistive-technology user | Human tester | PENDING — stated as a limitation in the README |

## Rules observed in this repository

- Agent reviews are always labeled by method and never presented as human or
  expert feedback.
- The sample timing JSON is labeled "constructed example" inside the file
  itself, not just in surrounding prose.
- No learning-gain, compliance ("WCAG certified"), or validation claims are
  made anywhere. Accessibility work is described as "designed to support" and
  "tested against".
- Pending results are written as PENDING, never filled with invented content.
