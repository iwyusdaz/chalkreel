#!/usr/bin/env node
/**
 * chalkreel make-srt
 *
 * Builds an .srt subtitle file from a word-level timing JSON produced by the
 * TTS alignment step. Cues are grouped from word timestamps so subtitles are
 * word-aligned: each cue starts when its first word starts and ends when its
 * last word ends, snapped to natural pauses.
 *
 * Timing JSON format (see skill/examples/sample-timing.json):
 * {
 *   "video": { "title": "...", "fps": 30 },
 *   "segments": [
 *     { "id": "seg-01", "text": "...", "start": 0.0,
 *       "words": [ { "w": "Word", "start": 0.0, "end": 0.18 }, ... ] }
 *   ]
 * }
 *
 * Usage:
 *   node make-srt.mjs <timing.json> [--out file.srt] [--max-chars 42]
 *                     [--max-cue-sec 4.0] [--gap-sec 0.45]
 *
 * Exit 0 on success.
 */

import { readFileSync, writeFileSync } from "node:fs";

function fail(msg) {
  console.error(`make-srt: ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const args = {
    input: null,
    out: null,
    maxChars: 42,
    maxCueSec: 4.0,
    gapSec: 0.45,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") args.out = argv[++i];
    else if (a === "--max-chars") args.maxChars = Number(argv[++i]);
    else if (a === "--max-cue-sec") args.maxCueSec = Number(argv[++i]);
    else if (a === "--gap-sec") args.gapSec = Number(argv[++i]);
    else if (a.startsWith("--")) fail(`unknown option ${a}`);
    else {
      if (args.input) fail("exactly one input file expected");
      args.input = a;
    }
  }
  if (!args.input) fail("usage: make-srt.mjs <timing.json> [--out file.srt]");
  return args;
}

function fmt(t) {
  if (t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const ms = Math.round((t - Math.floor(t)) * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(h)}:${p(m)}:${p(s)},${p(ms, 3)}`;
}

/** Group a segment's words into cues. */
function buildCues(words, opts) {
  const cues = [];
  let cur = [];
  let curChars = 0;

  const flush = () => {
    if (cur.length === 0) return;
    const start = cur[0].start;
    let end = cur[cur.length - 1].end;
    if (end <= start) end = start + 0.4;
    cues.push({ start, end, text: cur.map((w) => w.w).join(" ") });
    cur = [];
    curChars = 0;
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (!w || typeof w.w !== "string" || typeof w.start !== "number") {
      fail(`malformed word entry at index ${i}: ${JSON.stringify(w)}`);
    }
    const nextGap =
      i + 1 < words.length ? words[i + 1].start - w.end : Infinity;
    const isSentenceEnd = /[.!?]$/.test(w.w);
    const wouldBeTooLong =
      curChars + w.w.length + 1 > opts.maxChars && cur.length > 0;
    const tooLongCue =
      cur.length > 0 && w.end - cur[0].start > opts.maxCueSec;
    const atPause = nextGap >= opts.gapSec;

    cur.push(w);
    curChars += w.w.length + 1;

    if (isSentenceEnd || wouldBeTooLong || tooLongCue || atPause) {
      flush();
    }
  }
  flush();
  return cues;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let doc;
  try {
    doc = JSON.parse(readFileSync(args.input, "utf8"));
  } catch (e) {
    fail(`cannot read ${args.input}: ${e.message}`);
  }
  if (!Array.isArray(doc.segments)) fail("timing JSON has no segments array");

  const cues = [];
  for (const seg of doc.segments) {
    if (!Array.isArray(seg.words) || seg.words.length === 0) {
      fail(`segment ${seg.id || "?"} has no word timings`);
    }
    for (const cue of buildCues(seg.words, args)) {
      cues.push({ segId: seg.id, ...cue });
    }
  }
  cues.sort((a, b) => a.start - b.start);

  // Enforce monotonic, non-overlapping cues.
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].start < cues[i - 1].end) {
      cues[i - 1].end = Math.max(cues[i].start, cues[i - 1].end - 0.01);
    }
  }

  const srt = cues
    .map(
      (c, i) =>
        `${i + 1}\n${fmt(c.start)} --> ${fmt(c.end)}\n${c.text}\n`
    )
    .join("\n");

  if (args.out) {
    writeFileSync(args.out, srt, "utf8");
    console.log(
      `make-srt: wrote ${cues.length} cues -> ${args.out}`
    );
  } else {
    process.stdout.write(srt);
  }
}

main();
