#!/usr/bin/env node
/**
 * chalkreel lint-narration
 *
 * Checks a narration (voice-over) script for AI-writing tells BEFORE text-to-speech,
 * so the spoken track sounds like a person talking, not a model summarizing.
 *
 * Own implementation. The *idea* of a written-tells checklist is credited to:
 *   - blader/humanizer (https://github.com/blader/humanizer) — its 26-pattern list
 *     is documented publicly in its README; no code was copied.
 *   - Wikipedia's "Signs of AI writing" (https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
 * No code from either source is used here; the regexes, rule set, thresholds and
 * output format below are original to chalkreel (MIT).
 *
 * Usage:
 *   node lint-narration.mjs <script.txt> [--strict] [--json] [--max-words N]
 *
 * Exit codes: 0 = pass, 1 = findings at or above the failure threshold.
 */

import { readFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// Rule definitions. severity: "error" fails the lint, "warn" is advisory
// (fails only under --strict). Many lexicon rules are per-1000-words capped
// so a single legitimate word use does not fail an otherwise plain script.
// ---------------------------------------------------------------------------

const LEXICON_ERROR = [
  ["delve", /\bdelv(e|es|ed|ing)\b/gi],
  ["tapestry", /\btapestr(y|ies)\b/gi],
  ["testament-to", /\btestament to\b/gi],
  ["realm", /\brealm(s)?\b/gi],
  ["embark", /\bembark(s|ed|ing)?\b/gi],
  ["unlock", /\bunlock(s|ed|ing)?\b/gi],
  ["unleash", /\bunleash(es|ed|ing)?\b/gi],
  ["harness", /\bharness(es|ed|ing)?\b/gi],
  ["elevate", /\belevat(e|es|ed|ing)\b/gi],
  ["showcase", /\bshowcas(e|es|ed|ing)\b/gi],
  ["underscore-verb", /\bunderscor(e|es|ed|ing)\b/gi],
  ["game-changer", /\bgame[- ]chang(er|ing)\b/gi],
  ["cutting-edge", /\bcutting[- ]edge\b/gi],
  ["seamless", /\bseamless(ly)?\b/gi],
  ["revolutionize", /\brevolution(ize|izes|ized|izing|ary)\b/gi],
  ["transformative", /\btransformative\b/gi],
  ["ever-evolving", /\bever[- ]evolving\b/gi],
  ["vibrant", /\bvibrant(ly)?\b/gi],
  ["bustling", /\bbustling\b/gi],
  ["pivotal", /\bpivotal\b/gi],
  ["fast-paced-world", /\b(today'?s|in this) (fast[- ]paced )?world\b/gi],
  ["in-todays-era", /\bin (today'?s|this) (era|age|landscape|digital age)\b/gi],
  ["in-the-realm-of", /\bin the (realm|world|landscape) of\b/gi],
  ["when-it-comes-to", /\bwhen it comes to\b/gi],
  ["at-its-core", /\bat its (core|heart)\b/gi],
  ["important-to-note", /\b(it'?s|it is) (important|worth) (to note|noting)\b/gi],
  ["in-conclusion", /\bin conclusion\b/gi],
  ["navigate-figurative", /\bnavigat(e|es|ed|ing) (the|this|these|your)\b/gi],
  ["journey-metaphor", /\b(join me|come along) (on|for) (this|the|a) journey\b/gi],
  ["lets-dive", /\blet'?s (dive|delve|explore|unpack|embark)\b/gi],
  ["rich-tapestry-of", /\brich (history|heritage|blend|mix)\b/gi],
];

const LEXICON_WARN = [
  ["crucial-vital", /\b(crucial|vital|essential|fundamental) (for|to)\b/gi],
  ["plays-a-role", /\bplays? a (crucial|vital|key|pivotal|significant) role\b/gi],
  ["vague-superlative", /\b(incredibly|amazingly|fascinatingly|remarkably|astonishingly)\b/gi],
  ["moreover-furthermore", /\b(moreover|furthermore|additionally)\b/gi],
  ["in-summary", /\b(in summary|to summarize|to sum up)\b/gi],
];

const RULES = [
  {
    name: "em-dash-density",
    severity: "warn",
    description:
      "Em dashes used as a rhetorical crutch. Narration should read as plain speech; keep at most one per 150 words.",
  },
  {
    name: "rule-of-three",
    severity: "warn",
    description:
      "Triadic lists ('X, Y, and Z'). One or two real lists are fine in teaching content; a run of them is an AI rhythm tell.",
  },
  {
    name: "not-just-but",
    severity: "error",
    description:
      "'Not just X — it's Y' / 'not only ... but also' contrast frame.",
    patterns: [
      /\bnot (just|merely|only) [^.!?]*\b(but also|it'?s)\b/gi,
      /\bisn'?t (just|merely) [^.!?]*\b(it'?s|but)\b/gi,
      /\bdoesn'?t just [^.!?]*\b(it|but)\b/gi,
    ],
  },
  {
    name: "rhetorical-opener",
    severity: "error",
    description: "Hook-style rhetorical questions or imagination openers.",
    patterns: [
      /\b(ever|have you ever) wondered\b/gi,
      /\bwhat if (i|we) told you\b/gi,
      /\bimagine (this|for a moment)\b/gi,
      /\bpicture this\b/gi,
      /\bdid you know that\b/gi,
    ],
  },
  {
    name: "sycophantic-close",
    severity: "error",
    description: "Generic engagement closers.",
    patterns: [
      /\b(happy|enjoy the) (learning|journey|watching)\b/gi,
      /\bthanks for (watching|reading|joining)\b/gi,
      /\bsee you (in the )?next (video|time)\b/gi,
      /\bdon'?t forget to (like|subscribe|smash)\b/gi,
    ],
  },
  {
    name: "emoji",
    severity: "error",
    description: "Emoji in a voice-over script (TTS will read them or mangle them).",
    patterns: [
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,
    ],
  },
  {
    name: "markdown-in-vo",
    severity: "error",
    description:
      "Markdown emphasis or headings in a voice-over script. The script should be plain spoken prose; move structure notes to the storyboard.",
    patterns: [/\*\*[^*]+\*\*/g, /^#{1,6} /gm, /\[[^\]]+\]\([^)]+\)/g],
  },
  {
    name: "exclamation-storm",
    severity: "warn",
    description: "More than one exclamation mark per 200 words.",
  },
  {
    name: "adverb-flood",
    severity: "warn",
    description: "More than 2.5% of words are -ly adverbs.",
  },
  {
    name: "uniform-sentence-rhythm",
    severity: "warn",
    description:
      "Sentence lengths are suspiciously uniform (low variability). Human narration varies; measured as stdev/mean < 0.35 over 6+ sentences.",
  },
];

// ---------------------------------------------------------------------------

function fail(msg) {
  console.error(`lint-narration: ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const args = { file: null, strict: false, json: false, maxWords: 0 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--strict") args.strict = true;
    else if (a === "--json") args.json = true;
    else if (a === "--max-words") args.maxWords = Number(argv[++i]);
    else if (a.startsWith("--")) fail(`unknown option ${a}`);
    else {
      if (args.file) fail("exactly one input file expected");
      args.file = a;
    }
  }
  if (!args.file) fail("usage: lint-narration.mjs <script.txt> [--strict] [--json]");
  return args;
}

function findLines(text, match) {
  // Return 1-based line numbers where a regex match index occurs.
  const upto = text.slice(0, match.index);
  return upto.split("\n").length;
}

function excerpt(text, index, len = 60) {
  return text
    .slice(index, index + len)
    .replace(/\s+/g, " ")
    .trim();
}

function lint(text) {
  const findings = [];
  const push = (f) => findings.push(f);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const wordCount = words.length;
  const per1000 = Math.max(1, wordCount / 1000);

  // Lexicon rules: error lexicon fails on ANY occurrence; warn lexicon fails
  // only above a light density threshold (2 per 1000 words).
  for (const [name, re] of LEXICON_ERROR) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      push({
        rule: name,
        severity: "error",
        line: findLines(text, m),
        excerpt: excerpt(text, m.index),
        note: `AI-lexicon term "${m[0]}". Replace with plain wording.`,
      });
    }
  }
  for (const [name, re] of LEXICON_WARN) {
    re.lastIndex = 0;
    let m;
    let count = 0;
    while ((m = re.exec(text))) {
      count++;
      if (count <= 2) {
        push({
          rule: name,
          severity: "warn",
          line: findLines(text, m),
          excerpt: excerpt(text, m.index),
          note: `"${m[0]}" — fine occasionally, a smell when repeated.`,
        });
      }
    }
    if (count > Math.ceil(2 * per1000)) {
      push({
        rule: name,
        severity: "warn",
        line: 1,
        excerpt: `${count} occurrences in ${wordCount} words`,
        note: "density above 2 per 1000 words",
      });
    }
  }

  // Fixed pattern rules.
  for (const rule of RULES) {
    if (!rule.patterns) continue;
    for (const re of rule.patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        push({
          rule: rule.name,
          severity: rule.severity,
          line: findLines(text, m),
          excerpt: excerpt(text, m.index),
          note: rule.description,
        });
      }
    }
  }

  // Em dash density.
  const emDashes = (text.match(/—/g) || []).length;
  const emDashAllowance = Math.max(1, Math.floor(wordCount / 150));
  if (emDashes > emDashAllowance) {
    push({
      rule: "em-dash-density",
      severity: "warn",
      line: 1,
      excerpt: `${emDashes} em dashes in ${wordCount} words (allowance ${emDashAllowance})`,
      note: "Rewrite most as commas, periods, or parentheses.",
    });
  }

  // Rule of three: count "a, b, and c" style triads (genuine comma lists).
  const triads = [...text.matchAll(/\b[\w'-]+, [\w'-]+, and [\w'-]+\b/gi)];
  if (triads.length > 2) {
    push({
      rule: "rule-of-three",
      severity: "warn",
      line: findLines(text, triads[2]),
      excerpt: excerpt(text, triads[2].index),
      note: `${triads.length} triadic lists — a run of them is an AI rhythm tell. Keep only the ones that carry real content.`,
    });
  } else if (triads.length > 0) {
    push({
      rule: "rule-of-three",
      severity: "warn",
      line: findLines(text, triads[0]),
      excerpt: excerpt(text, triads[0].index),
      note: "Triadic list present — fine if it is a genuine list; flagging for review.",
    });
  }

  // Exclamation density.
  const bangs = (text.match(/!/g) || []).length;
  if (bangs > Math.max(1, Math.floor(wordCount / 200))) {
    push({
      rule: "exclamation-storm",
      severity: "warn",
      line: 1,
      excerpt: `${bangs} exclamation marks in ${wordCount} words`,
      note: "Spoken narration rarely needs them.",
    });
  }

  // Adverb flood.
  const adverbs = words.filter((w) => /ly$/.test(w) && w.length > 4).length;
  const adverbRate = wordCount ? adverbs / wordCount : 0;
  if (adverbRate > 0.025 && adverbs >= 3) {
    push({
      rule: "adverb-flood",
      severity: "warn",
      line: 1,
      excerpt: `${adverbs} -ly adverbs (${(adverbRate * 100).toFixed(1)}%)`,
      note: "Trim adverbs; use stronger verbs.",
    });
  }

  // Uniform sentence rhythm.
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const lens = sentences.map((s) => s.split(/\s+/).length);
  if (lens.length >= 6) {
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    const variance =
      lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    if (cv < 0.35) {
      push({
        rule: "uniform-sentence-rhythm",
        severity: "warn",
        line: 1,
        excerpt: `${lens.length} sentences, mean ${mean.toFixed(1)} words, variability ${cv.toFixed(2)}`,
        note: "Vary sentence length; mix short punches with longer lines.",
      });
    }
  }

  return { findings, wordCount };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let text;
  try {
    text = readFileSync(args.file, "utf8");
  } catch (e) {
    fail(`cannot read ${args.file}: ${e.message}`);
  }

  if (args.maxWords && text.split(/\s+/).length > args.maxWords) {
    console.error(
      `lint-narration: script exceeds --max-words ${args.maxWords} (length budget gate)`
    );
    process.exit(1);
  }

  const { findings, wordCount } = lint(text);
  const errors = findings.filter((f) => f.severity === "error");
  const warns = findings.filter((f) => f.severity === "warn");
  const failed = errors.length > 0 || (args.strict && warns.length > 0);

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          file: args.file,
          words: wordCount,
          passed: !failed,
          strict: args.strict,
          errors,
          warnings: warns,
        },
        null,
        2
      )
    );
  } else {
    console.log(`lint-narration: ${args.file} (${wordCount} words)`);
    for (const f of [...errors, ...warns]) {
      console.log(
        `  ${f.severity === "error" ? "ERROR" : "WARN "} [${f.rule}] line ${f.line}: ${f.excerpt}`
      );
      if (f.note) console.log(`        ${f.note}`);
    }
    console.log(
      `  ${errors.length} error(s), ${warns.length} warning(s) -> ${
        failed ? "FAIL" : "PASS"
      }${args.strict ? " (strict)" : ""}`
    );
  }

  process.exit(failed ? 1 : 0);
}

main();
