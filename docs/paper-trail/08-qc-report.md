# Paper trail, step 8 — QC report against the written Mayer criteria

This report scores the sample project against the QC criteria pack in
`skill/SKILL.md` (§ QC criteria). Method: **Agent heuristic review** — an
automated script pass plus a structured review performed by the build agent,
not a human expert panel and not a learner test. That is what the evidence can
support at this stage; see the limits section.

Review date: 2026-10-31 · Reviewer: agent heuristic review (build agent, same
model as author — disclosed limitation) · Subject: storyboard
`04-storyboard.json`, narration `03-narration.md`, subtitles
`06-subtitles.srt`, transcript `../transcript.html`.

## Automated checks (ran, real output)

| Check | Tool | Result |
|---|---|---|
| Objective is ABCD-measurable | `objective-gate.mjs` | PASS (audience, behavior, condition, degree all found) |
| Narration free of AI-writing tells | `lint-narration.mjs` | PASS, 0 errors / 0 warnings |
| No info in audio alone | `a11y-lint.mjs` | PASS — 6 segments, 3 fact tokens cross-checked, 0 audio-only |
| Subtitle word coverage | round-trip check | 250/250 narration words present in SRT; 41 cues, monotonic |
| Transcript completeness | round-trip check | all 6 segment ids + narration + on-screen text + AD notes present |

## Mayer-principle criteria (desk check against storyboard + script)

| Principle | Written criterion (summary) | Score | Notes |
|---|---|---|---|
| Segmenting | Content is pre-segmented into learner-paced beats of 10–30 s with clear boundaries | PASS | 6 segments, 12.9–21.4 s, each with its own visual scene |
| Signaling | Key terms and numbers are highlighted on screen at the moment they are spoken | PASS | years 1909/2006/2017 appear on the timeline exactly when narrated; term "desirable difficulty" captioned in seg-04 |
| Coherence | No decorative graphics, background music cues, or interesting-but-irrelevant facts | PASS | every visual element maps to a narrated idea; no music specified |
| Redundancy | Narration does not read the on-screen text verbatim; screen text is spare (labels, not sentences) | PASS | narration paraphrases; on-screen items are 2–7 word labels |
| Spatial contiguity | Labels sit next to the thing they describe (same scene, adjacent position) | PASS (by construction) | storyboard specifies labels adjacent to timeline dots, arrows, list items |
| Temporal contiguity | Corresponding narration and animation are simultaneous, not sequential | PASS (by construction) | each element's reveal is cued to its narration line in the timing JSON |
| Accessibility | SRT + transcript + AD notes emitted; no audio-only facts | PASS | see automated checks above |
| Traceability | Every factual claim has a ledger row with a source | PASS | 5 claims used, 1 cut and marked |

## Render-frame QC

A short demo render (first 12 seconds, segments 1–2, silent — no TTS in this
run; see the pending note below) was produced with `template/`, plus still
frames from all six segments. Frame review method: **Agent heuristic review**
(build agent inspecting rendered PNGs against the written criteria; same model
as author — disclosed limitation).

| Frame / still | Criterion | Score | Note |
|---|---|---|---|
| `template/out/frame-250.png` (seg-01 statement) | Legibility, signaling | PASS | Headline legible; amber underline draws on; caption plate with bolded active word; progress bar correct |
| `template/out/frame-1250.png` (seg-03 timeline) — first pass | Spatial contiguity | **FAIL** | The chalk line crossed through the label text ("First recall experiments" appeared struck through). Fixed in `TimelineScene.tsx` (fixed vertical layout: line through dots only), re-rendered, re-checked. |
| `template/out/frame-1250.png` — after fix | Spatial contiguity | PASS | Line passes through dots; year above, label below; no overlap |
| `template/out/frame-1850.png` (seg-04 cycle) | Coherence, signaling | PASS | Three labeled boxes + "Desirable difficulty" caption; nothing decorative |
| `template/out/frame-2500.png` (seg-05 list) | Redundancy, legibility | PASS | Numbered labels only; narration paraphrases; no verbatim duplication |
| `template/out/frame-3050.png` (seg-06 statement) | Legibility | PASS | Closing line + underline clean; caption plate absent at that moment (between cues) — matches timing gap in the source |
| `template/out/sample.mp4` (12 s, segments 1–2) | Temporal contiguity (spot check) | PASS | Caption cue boundaries align with word timestamps; no element appears before its narration line |

Assets committed for review: `docs/assets/frame-statement.png`,
`docs/assets/frame-timeline.png`, `docs/assets/frame-list.png`, and
`docs/assets/sample-segment-demo.mp4` (12-second silent visual render of
segments 1–2, labeled as a constructed example — the narration audio was not
recorded in this run).

### Still pending

- **Full-length render with audio.** The template renders; the 110-second
  full video with a kokoro-82m TTS voiceover was not produced in this build
  run (no TTS voice was recorded). The 12-second silent render demonstrates
  the visual pipeline end to end.
- **Word-alignment audio spot-check** (10 cues against real audio) requires
  the TTS run above.

## What this evidence can and cannot show

- **Can show:** the pipeline's written criteria were applied mechanically and
  transparently, and the sample project satisfies them at script/storyboard
  level; the accessibility tooling catches real violations (see the negative
  fixtures).
- **Cannot show:** that the video teaches anything (no learner testing), that
  the rendered frames are visually clean (no full render QC yet), or that
  human experts endorse the content (no expert panel ran).

## Revisions this QC led to

- The 1909/2006/2017 years were moved from "research notes only" onto the
  seg-03 timeline so the a11y fact-check would pass (they originally appeared
  in narration alone).
- No percentage was allowed into seg-03 despite drafting pressure; the ledger
  records why.
