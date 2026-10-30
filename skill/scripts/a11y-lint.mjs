#!/usr/bin/env node
/**
 * chalkreel a11y-lint
 *
 * The "no information in audio alone" check. For each storyboard segment it
 * verifies that every fact carried by the narration is also present on screen
 * (or in the transcript/AD notes), so a deaf or hard-of-hearing viewer — or
 * anyone watching with sound off, as most learners do — loses nothing.
 *
 * What it checks per segment:
 *   1. narration present
 *   2. on-screen reinforcement: the segment shows text or a labeled visual
 *   3. FACT EXTRACTION: numbers, dates, named entities, and domain terms
 *      spoken in the narration must also appear in onScreenText / the visual
 *      description. A number in the audio that appears nowhere on screen is
 *      the classic "info in audio alone" failure.
 *   4. audioDescriptionNote present
 *   5. claims referenced in the storyboard (traceability hook)
 *   plus global checks: timings consistent, transcript emitted flag, claims
 *   ledger reference.
 *
 * Storyboard JSON format (see skill/examples/sample-storyboard.json):
 * {
 *   "video": { "title": "...", "fps": 30, "language": "en",
 *              "transcriptEmitted": true, "srtEmitted": true,
 *              "claimsLedger": "docs/paper-trail/07-claims-ledger.md" },
 *   "segments": [ {
 *     "id": "seg-01", "title": "Hook", "startSec": 0, "durationSec": 12.5,
 *     "narration": "...",
 *     "visual": { "backdrop": "chalkboard", "description": "...",
 *                 "onScreenText": ["..."] },
 *     "audioDescriptionNote": "...",
 *     "claims": ["claim-001"]
 *   } ]
 * }
 *
 * Usage: node a11y-lint.mjs <storyboard.json> [--json]
 * Exit 0 = pass, 1 = violations found, 2 = usage error.
 */

import { readFileSync } from "node:fs";

function fail(msg) {
  console.error(`a11y-lint: ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const args = { input: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a.startsWith("--")) fail(`unknown option ${a}`);
    else {
      if (args.input) fail("exactly one input file expected");
      args.input = a;
    }
  }
  if (!args.input) fail("usage: a11y-lint.mjs <storyboard.json> [--json]");
  return args;
}

const STOP = new Set(
  ("a an the this that these those of in on at to for with by from as is are was " +
    "were be been being it its it's you your we our they their he she his her and " +
    "or but if then than so not no yes do does did done can could should would will " +
    "shall may might must have has had get gets got goes go going come comes came " +
    "what which who whom whose when where why how all any both each few more most " +
    "other some such only own same too very just also about into over under again " +
    "once here there out up down off between because while during before after " +
    "one two three four five six seven eight nine ten first second third next last " +
    "new now well way ways thing things lot lots really quite even ever never " +
    "let lets us am i'm don't doesn't didn't isn't aren't won't can't that's " +
    "instead instead back still yet much many little long good bad better best")
    .split(/\s+/)
);

/** Extract "fact tokens" from narration: numbers/dates, capitalized named
 *  entities (not at sentence start), and multiword domain terms in quotes. */
function extractFacts(narration) {
  const facts = new Set();

  // Numbers, percentages, ranges, "50 percent", "2006", "4 of 5".
  for (const m of narration.matchAll(
    /\b\d+(?:[.,]\d+)?(?:\s?(?:%|percent|million|thousand|billion))?\b/g
  )) {
    if (m[0].trim()) facts.add(m[0].trim());
  }

  // Quoted terms.
  for (const m of narration.matchAll(/["“']([^"”']{3,})["”']/g)) {
    facts.add(m[1].trim());
  }

  // Capitalized words not at sentence start (likely names/terms).
  const sentences = narration.split(/(?<=[.!?])\s+/);
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    // Capitalized word right after a sentence-starting capitalized word
    // (e.g. "Roediger Karpicke"): catch it too. (Checked before the loop,
    // which starts at i = 1.)
    if (words.length > 1) {
      const w1 = words[1].replace(/[^\w'-]/g, "");
      if (w1.length > 2 && /^[A-Z][a-z]/.test(w1)) facts.add(w1);
    }
    for (let i = 1; i < words.length; i++) {
      const w = words[i].replace(/[^\w'-]/g, "");
      if (
        w.length > 2 &&
        /^[A-Z][a-z]/.test(w) &&
        !STOP.has(w.toLowerCase()) &&
        !STOP.has(words[i - 1].replace(/[^\w'-]/g, "").toLowerCase())
      ) {
        facts.add(w);
      }
    }
  }
  return [...facts];
}

function haystack(seg) {
  const parts = [];
  const v = seg.visual || {};
  parts.push(v.description || "");
  for (const t of v.onScreenText || []) parts.push(t);
  for (const e of v.elements || []) {
    if (typeof e === "string") parts.push(e);
    else if (e && typeof e.label === "string") parts.push(e.label);
    else if (e && typeof e.desc === "string") parts.push(e.desc);
  }
  return parts.join(" \n ");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let doc;
  try {
    doc = JSON.parse(readFileSync(args.input, "utf8"));
  } catch (e) {
    fail(`cannot read ${args.input}: ${e.message}`);
  }
  if (!Array.isArray(doc.segments) || doc.segments.length === 0) {
    fail("storyboard has no segments array");
  }

  const violations = [];
  const advisories = [];
  const add = (segId, check, detail) =>
    violations.push({ segment: segId, check, detail });
  const note = (segId, check, detail) =>
    advisories.push({ segment: segId, check, detail });

  let cursor = 0;
  const totalFacts = { checked: 0, audioOnly: 0 };

  for (const seg of doc.segments) {
    const id = seg.id || "(no id)";

    if (!seg.narration || !seg.narration.trim()) {
      add(id, "narration-present", "Segment has no narration text.");
    }

    const v = seg.visual || {};
    const hasOnScreen =
      Array.isArray(v.onScreenText) && v.onScreenText.length > 0;
    const hasElements = Array.isArray(v.elements) && v.elements.length > 0;
    if (!hasOnScreen && !hasElements) {
      add(
        id,
        "on-screen-reinforcement",
        "No on-screen text and no visual elements. Every segment must show something; audio alone fails the check."
      );
    } else if (!hasOnScreen) {
      note(
        id,
        "on-screen-reinforcement",
        "Visual elements present but no onScreenText. If any narration fact is not drawn, it is audio-only."
      );
    }

    // Fact extraction and cross-check.
    const hay = haystack(seg);
    const facts = extractFacts(seg.narration || "");
    for (const f of facts) {
      totalFacts.checked++;
      const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(^|[^\\w])${escaped}([^\\w]|$)`, "i");
      if (!re.test(hay)) {
        totalFacts.audioOnly++;
        add(
          id,
          "no-info-in-audio-alone",
          `Narration mentions "${f}" but it appears nowhere on screen in this segment. Either draw it (on-screen text or labeled visual), move it to the transcript/AD notes explicitly, or reword the narration.`
        );
      }
    }

    if (!seg.audioDescriptionNote || !seg.audioDescriptionNote.trim()) {
      add(
        id,
        "ad-note-present",
        "Missing audioDescriptionNote. Describe what is shown for blind and low-vision viewers."
      );
    }

    if (!Array.isArray(seg.claims) || seg.claims.length === 0) {
      note(
        id,
        "claims-traceability",
        "No claims referenced. If the narration states a fact, add a claim id pointing into the claims ledger."
      );
    }

    // Timing consistency.
    if (typeof seg.startSec === "number" && seg.startSec < cursor - 0.001) {
      add(
        id,
        "timing-consistent",
        `Segment starts at ${seg.startSec}s but the previous segment already ran past it (cursor ${cursor}s).`
      );
    }
    if (typeof seg.startSec === "number" && typeof seg.durationSec === "number") {
      cursor = Math.max(cursor, seg.startSec + seg.durationSec);
    } else {
      add(id, "timing-consistent", "Segment missing startSec or durationSec.");
    }
  }

  // Global deliverable checks.
  const meta = doc.video || {};
  if (!meta.srtEmitted) {
    add("(global)", "srt-emitted", "video.srtEmitted is false — subtitles are a required deliverable.");
  }
  if (!meta.transcriptEmitted) {
    add("(global)", "transcript-emitted", "video.transcriptEmitted is false — a transcript page is a required deliverable.");
  }
  if (!meta.claimsLedger) {
    note("(global)", "claims-ledger", "video.claimsLedger not set; narration claims will not be traceable to sources.");
  }

  const passed = violations.length === 0;

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          file: args.input,
          passed,
          segments: doc.segments.length,
          factsChecked: totalFacts.checked,
          audioOnlyFacts: totalFacts.audioOnly,
          violations,
          advisories,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `a11y-lint: ${passed ? "PASS" : "FAIL"} — ${doc.segments.length} segment(s), ${totalFacts.checked} fact token(s) cross-checked, ${totalFacts.audioOnly} audio-only`
    );
    for (const v of violations) {
      console.log(`  VIOLATION [${v.check}] ${v.segment}: ${v.detail}`);
    }
    for (const a of advisories) {
      console.log(`  advisory  [${a.check}] ${a.segment}: ${a.detail}`);
    }
    console.log(
      `  ${violations.length} violation(s), ${advisories.length} advisory(ies) -> ${passed ? "PASS" : "FAIL"}`
    );
  }
  process.exit(passed ? 0 : 1);
}

main();
