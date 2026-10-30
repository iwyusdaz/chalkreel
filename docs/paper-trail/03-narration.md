# Paper trail, step 3 — Narration script (GATE 2)

The voice-over script below is the exact text of
`skill/examples/good-narration.txt` (the plain prose file that the lint runs
on). It passed `lint-narration.mjs` with 0 errors and 0 warnings, and every
segment sits inside its 15–30 s budget (250 words total at ~145 wpm ≈ 104 s of
speech + pauses ≈ 110 s).

Reading-level note: written for a general first-year university audience;
short sentences, concrete verbs, no unexplained terms.

## seg-01 — Hook (budget 15–25 s)

> Close this book. Try to remember what you just read. Harder than rereading
> it, right? That struggle is the point. It is called retrieval practice, and
> it is one of the best-studied ways to make learning stick.

## seg-02 — What retrieval practice is (budget 15–25 s)

> Retrieval practice means pulling information out of your memory instead of
> putting it in again. Rereading feels productive because the page looks
> familiar. But familiarity is not the same as being able to recall it later,
> without the book.

## seg-03 — The evidence (budget 20–30 s)

> The evidence goes back to 1909, but a clear modern test came in 2006. Two
> researchers asked students to either reread a passage or practice recalling
> it. One week later, the recall group remembered substantially more. A 2017
> review of dozens of experiments found the same pattern across ages and
> subjects.

Claim traceability: 1909 → claim-001, the 2006 experiment → claim-002, the
2017 review → claim-003 (see `02-research-notes.md`). Deliberately no
percentage is quoted; see the honesty note in the research notes.

## seg-04 — Why it works (budget 15–25 s)

> Why does struggling to recall help? Each time you pull a memory out, your
> brain rebuilds the path to it, and the path gets easier to find next time.
> Psychologists call this a desirable difficulty. The effort is not a sign of
> failure, it is part of how the memory gets stronger.

Claim traceability: desirable difficulty → claim-004.

## seg-05 — Three ways to use it (budget 20–30 s)

> You can use this in three ways. Write practice questions and answer them
> from memory. Make flashcards and grade yourself honestly. Or do a brain
> dump: close your notes and write down everything you remember about the
> topic, then check what you missed.

Claim traceability: backing for the recommendation → claim-005.

## seg-06 — Recap and close (budget 10–20 s)

> So the next time you study, skip the highlighter marathon. Close the book
> first and try to recall. When recall is hard, that is when learning is
> happening.

## What the humanizer pass changed

Draft lines that the lint caught in early drafting, and how they were fixed:

- "Retrieval practice is a game-changer for learners" → cut; replaced by the
  concrete hook (seg-01).
- "It's not just memorization — it's building understanding" → rewritten as
  the plain contrast in seg-02.
- "Let's dive into the science" → cut; the evidence segment now opens with
  the claim itself.
