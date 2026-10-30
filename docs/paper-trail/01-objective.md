# Paper trail, step 1 — Objective (GATE 1 input)

Sample project: **"How retrieval practice works"** — a short explainer used as
the worked example across this repo. Everything in `docs/paper-trail/` was
produced by running the chalkreel pipeline scripts on this objective; where a
step normally depends on a live TTS or render run, the artifact is labeled as
a constructed example.

## Objective as fed to the gate

```
Given a passage they have just studied, first-year university students will
recall its main points from memory, restating at least 3 of 5 main points
correctly on a next-day quiz.
```

## Gate check

Run:

```
node skill/scripts/objective-gate.mjs "$(cat docs/paper-trail/01-objective-statement.txt)"
```

Result: **PASS** — Audience (first-year university students), Behavior
(recall/restating), Condition (given a passage just studied, from memory),
Degree (at least 3 of 5 main points, next-day quiz).

## Learner-visible framing (read at the top of the video)

> By the end of this video, you will be able to explain why trying to recall
> something from memory beats rereading, and use three recall-based study
> methods the same day.

## Beat map (segments, per Mayer's segmenting principle)

| # | Beat | Budget |
|---|------|--------|
| 1 | Hook: recalling is harder than rereading — and that is the point | 15–25 s |
| 2 | Definition: retrieval practice, familiarity vs. recall | 15–25 s |
| 3 | Evidence: 1909 origin, 2006 experiment, 2017 review | 20–30 s |
| 4 | Mechanism: desirable difficulty | 15–25 s |
| 5 | Three recall-based study methods | 20–30 s |
| 6 | Recap and close | 10–20 s |

GATE 1: the objective, beat map and budgets above are what the human approves
before any research or scripting starts.
