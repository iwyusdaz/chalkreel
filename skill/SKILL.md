---
name: chalkreel
description: >-
  Learning objective in, accessible explainer video out. Turns a measurable
  learning objective into a short, code-drawn explainer video with narration,
  word-aligned subtitles, transcript, audio-description notes, sourced-claim
  traceability, and QC against written Mayer multimedia-principle criteria.
  Four human approval gates. No generative video models, no stock footage.
  Use when an e-learning developer, instructional designer, or educator wants
  a teaching video that starts from an objective rather than a topic.
license: MIT
---

# chalkreel — objective in, accessible explainer video out

You are producing a **learning** explainer video. Unlike engagement-optimized
AI explainers, a learning video starts from a measurable objective, manages
cognitive load on purpose (Mayer's multimedia principles), and ships
accessibility deliverables — captions, transcript, audio-description notes —
as first-class outputs, not afterthoughts. Every factual claim in the
narration traces to a source.

Everything a viewer hears must also be seeable or readable. Everything a
learner is told must be traceable. Nothing ships without a human gate.

## Hard rules

1. **No generative video models. No stock footage. No image generators for
   scene content.** Frames are drawn in code (Remotion components, SVG, CSS).
   This keeps every frame reviewable, diffable, and reproducible.
2. **Four human gates.** Never proceed past a gate without explicit approval
   recorded in the project log: GATE 1 objective + beat map, GATE 2 narration
   script, GATE 3 visual style, GATE 4 final cut.
3. **Label everything synthetic.** Constructed example data, simulated
   timings, and agent-review results are labeled as such in the file itself.
   Never present a dry artifact as a real rendered/tts output.
4. **Claims before script.** Research notes with sourced claims exist before
   narration is written, and no number enters the script without a ledger row.
5. **Local-first TTS.** Default voice is kokoro-82m (local, free). Bring-your-
   own TTS is supported; never call a cloud TTS without the user's configured
   key. No local models other than the TTS the user chooses.

## Inputs

```
objective:    one measurable sentence (ABCD — the objective gate enforces this)
audience:     who is learning, and their assumed prior knowledge
length:       target duration (default 60–120 s)
language:     narration language (default en)
```

Reject topics. "A video about photosynthesis" is not an input; run
`scripts/objective-gate.mjs` and iterate with the user until it passes.

## Pipeline

```
objective + audience + prior knowledge + length + language
  |
  +-- 1. OBJECTIVE GATE    objective-gate.mjs; rewrite topic -> ABCD objective;
  |                        learner-visible "you will be able to..." framing;
  |                        beat map segmented per Mayer segmenting (10-30 s beats)
  |                        << GATE 1: user approves objective + beat map
  +-- 2. RESEARCH          extract claims, find sources, write claims ledger
  |                        (claim-001 style ids; sources with title/venue/year;
  |                        vague wording preferred over invented statistics)
  +-- 3. NARRATION         script per segment budget; humanizer lint pass
  |                        (scripts/lint-narration.mjs must exit 0);
  |                        reading-level check vs audience
  |                        << GATE 2: user approves script
  +-- 4. STYLE BAKE-OFF    render the SAME beat in 2-3 backdrop/theme variants
  |                        with the template; user picks by eye
  |                        << GATE 3: user picks a style
  +-- 5. BUILD             one Remotion segment component per beat (template/);
  |                        TTS with word timestamps (kokoro-82m default, BYO ok);
  |                        build timing JSON {segments[].words[{w,start,end}]}
  +-- 6. ACCESSIBILITY     make-srt.mjs (word-aligned SRT), make-transcript.mjs
  |                        (transcript HTML), audio-description notes per
  |                        segment, then a11y-lint.mjs MUST pass
  +-- 7. QC                score rendered frames + script against the written
  |                        criteria below; write qc-report.md with method labels
  |                        << GATE 4: user reviews final cut
  +-- deliver: video.mp4 + .srt + transcript.html + instructor-notes.md
      + claims ledger + full paper trail (objective, research, narration,
      storyboard, timing, qc report)
```

### Segment budgets

- 10–30 s per segment (Mayer segmenting; hard cap 30 s without user override).
- ~145 words per 60 s of narration; one idea per segment.
- On-screen text: labels and short phrases only (2–7 words), never the
  narration read verbatim (redundancy principle).
- Each segment defines: narration, one scene kind, on-screen text,
  audio-description note, claim ids.

### TTS defaults

- Default: kokoro-82m, local. Voice: `af_heart` (or user's pick). Speed 1.0.
- Capture **per-word timestamps** from the TTS/aligner into timing JSON. If
  the TTS cannot emit them, align with a forced aligner; never guess timings —
  a guessed alignment makes captions drift, and the round-trip check will
  catch mismatched text but not drifted times.
- BYO TTS: any engine that returns word-level timestamps; document the engine
  and voice in the project log.

## Scripts (all standalone, node >=18, no dependencies)

| Script | Purpose | Exit 0 means |
|---|---|---|
| `scripts/objective-gate.mjs "<objective>"` | validates ABCD objective | the objective is measurable |
| `scripts/lint-narration.mjs <script.txt>` | AI-writing-tell checker (run before TTS) | script sounds human enough to record |
| `scripts/make-srt.mjs <timing.json> --out x.srt` | word-aligned SRT from timing JSON | SRT written |
| `scripts/make-transcript.mjs --timing <timing.json> --storyboard <sb.json> --out t.html` | accessible transcript page | HTML written |
| `scripts/a11y-lint.mjs <storyboard.json>` | "no info in audio alone" + deliverable checks | every narration fact is on screen or in transcript/AD notes |

Negative fixtures live in `examples/` (`bad-narration.txt`,
`bad-storyboard.json`) — always verify a fresh setup by running the lints on
them and confirming they FAIL.

## File formats

**timing.json** — per-word timestamps (from TTS alignment):

```json
{ "video": { "title": "...", "fps": 30 },
  "segments": [ { "id": "seg-01", "text": "...", "start": 0.0,
    "words": [ { "w": "Close", "start": 0.1, "end": 0.34 } ] } ] }
```

**storyboard.json** — one object per segment:

```json
{ "video": { "title": "...", "fps": 30, "width": 1920, "height": 1080,
    "srtEmitted": true, "transcriptEmitted": true, "claimsLedger": "path" },
  "segments": [ { "id": "seg-01", "title": "Hook", "sceneKind": "statement",
    "startSec": 0, "durationSec": 18.2, "narration": "...",
    "visual": { "backdrop": "chalkboard", "description": "...",
                "onScreenText": ["Recall beats rereading"] },
    "audioDescriptionNote": "...", "claims": [] } ] }
```

`sceneKind` maps to a template component: `statement`, `definition`,
`timeline`, `cycle`, `list`, `caption`. Add new kinds in the template, not as
one-off components inside a project.

## QC criteria pack (score rendered output against THIS, in writing)

A QC agent does not "watch" the video and opine. It scores each criterion
pass/fail with a quoted observation. Frame-level checks need rendered frames;
script-level checks run on the artifacts. Write the result to `qc-report.md`
and label the review method (e.g. "Agent heuristic review").

### Script-level (run every time)

1. **Objective alignment** — every segment advances the approved objective;
   anything that does not is cut (coherence principle applied to goals).
2. **Claims traceability** — every number, date, or named finding in the
   narration has a claims-ledger row with a source. Fail on any orphan fact.
3. **Narration lint** — `lint-narration.mjs` exits 0.
4. **Reading level** — sentences average under ~17 words; no unexplained
   technical term; concrete verbs over abstractions.
5. **Accessibility bundle** — `a11y-lint.mjs` exits 0; SRT and transcript
   exist; AD note present for every segment.

### Frame-level (run on rendered frames or screenshots per segment)

6. **Signaling** — the key term/number of the moment is visually highlighted
   (chalk underline, color, arrow) exactly while it is narrated.
7. **Coherence** — nothing decorative on screen; every element maps to a
   narrated idea; no background music unless the user asked.
8. **Redundancy** — on-screen text does not duplicate narration verbatim; it
   is labels and short phrases.
9. **Spatial contiguity** — labels are adjacent to the thing they describe;
   no legend-to-chart treasure hunts within a frame.
10. **Temporal contiguity** — an element's reveal is synchronized with its
    narration line (check against timing.json), not shown before or after.
11. **Legibility** — chalk lines contrast with the backdrop (>= 4.5:1 for
    on-screen text equivalents); nothing clipped at 1920x1080 or 1280x720.
12. **Motion budget** — animations settle within 1.2 s; nothing moves during
    a sentence that introduces a different idea.

Score each PASS/FAIL with evidence. Any FAIL on 1–5 blocks GATE 4. Any FAIL
on 6–12 requires a fix and re-render of that segment, or an explicit user
acceptance.

## Style defaults (GATE 3 bake-off)

- Backdrop: `chalkboard` (deep slate-green, subtle texture, soft vignette).
  Alternatives for the bake-off: `paper` (warm off-white, ink lines), `night`
  (near-black, single accent color).
- Palette: chalk-white primary, one accent (amber #FFC66D) for highlights.
  Highlight only what signaling requires.
- Type: large (>= 64 px at 1080p), high contrast; captions bottom-center with
  translucent plate, max 2 lines / 42 chars per line.
- Respect the viewer: no flashing (> 3 flashes/s banned), motion settles fast,
  progress bar shows chapter position.

## Paper trail (commit all of it)

```
01-objective.md (+ gate output)     05-timing.json
02-research-notes.md                06-subtitles.srt
03-narration.md                     07-claims-ledger.md
04-storyboard.json                  08-qc-report.md
```

The paper trail is the product as much as the video: it is what makes the
pipeline auditable by another instructional designer.

## Honest limits (say these in the project log)

- Agent QC is heuristic review by a model, not expert endorsement.
- No claim that an output is "instructionally validated" — that requires
  learner testing this skill does not do.
- Word-aligned subtitles are only as good as the TTS alignment; spot-check 10
  cues against the audio before GATE 4.
- Voice licensing: kokoro-82m voices have their own usage terms; check before
  commercial distribution.

## Attribution

Method-level inspiration, no copied code: anything2explainer (PolyForm
Noncommercial — method only, see this repo's ATTRIBUTION.md), the gated
approval flow pattern from vox-director (MIT), and the AI-writing-tells
checklist concept from blader/humanizer and Wikipedia's "Signs of AI writing"
(this repo's lint is an independent implementation).
