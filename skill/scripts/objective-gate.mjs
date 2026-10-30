#!/usr/bin/env node
/**
 * chalkreel objective-gate
 *
 * Validates that the input to the video pipeline is a measurable learning
 * objective in ABCD format, not just a topic. A video that starts from a topic
 * optimizes for engagement; a video that starts from an objective can be QC'd
 * against it. This is the GATE 1 check.
 *
 * ABCD ( Heinich et al. ):
 *   A — Audience: who is learning
 *   B — Behavior: an observable, measurable verb (Bloom's taxonomy level verbs)
 *   C — Condition: under what circumstances the behavior is performed
 *   D — Degree: how well, how many, how fast (the success criterion)
 *
 * Usage:
 *   node objective-gate.mjs "<objective statement>"
 *   node objective-gate.mjs --json "<objective statement>"
 *   node objective-gate.mjs --file objective.txt
 *
 * Input may also be a JSON object with keys {audience, behavior, condition,
 * degree, objective}. Exit 0 = gate passes, 1 = gate fails, 2 = usage error.
 */

import { readFileSync } from "node:fs";

const OBSERVABLE_VERBS = [
  // remember / understand-applied
  "define", "list", "name", "recall", "identify", "label", "match", "select",
  "recognize", "describe", "explain", "paraphrase", "summarize", "classify",
  "compare", "contrast", "outline", "organize", "give examples", "convert",
  // apply / analyze
  "demonstrate", "apply", "use", "solve", "calculate", "compute", "estimate",
  "implement", "execute", "differentiate", "distinguish", "diagnose",
  "categorize", "deconstruct", "attribute", "attribute", "test", "inspect",
  // evaluate / create
  "critique", "justify", "evaluate", "defend", "judge", "assess", "prioritize",
  "design", "construct", "create", "produce", "write", "compose", "plan",
  "revise", "choose", "determine", "sort", "arrange", "perform", "measure",
];

const UNMEASURABLE_VERBS = [
  "understand", "know", "learn", "appreciate", "be aware", "grasp",
  "be familiar", "familiarize", "realize", "value", "believe", "see",
  "think about", "recognize the importance", "gain insight",
];

const CONDITION_MARKERS = [
  /\bgiven\b/i, /\busing\b/i, /\bwithout\b/i, /\bafter\b/i, /\bfrom memory\b/i,
  /\bwith (the|a|an)\b/i, /\bin (a|the) [\w-]+ (setting|context|environment|scenario|case|session|simulator|lab)\b/i,
  /\bwhen (provided|presented|shown|given)\b/i, /\bbased on\b/i, /\bwithin\b/i,
  /\bduring\b/i, /\breferring to\b/i, /\baccording to\b/i, /\bwhile\b/i,
  /\busing only\b/i, /\bin ([0-9]+|under) \w*\s?(minutes?|seconds?)\b/i,
];

const DEGREE_MARKERS = [
  /\b(at least|no more than|no fewer than|within)\b/i,
  /\b[0-9]+\s?(%|percent|points?|of [0-9]+|items?|cases?|questions?|steps?|minutes?|seconds?)\b/i,
  /\b(correctly|accurately|in the correct order|error[- ]free|all of|every)\b/i,
  /\b(with (a|an|the) (score|accuracy|rate) of)\b/i,
  /\b(successfully|without (any )?(errors?|mistakes?|hints?|assistance))\b/i,
  /\b[0-9]+\s?(out of|of)\s+[0-9]+\b/i,
];

function fail(msg, code = 2) {
  console.error(`objective-gate: ${msg}`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { text: null, json: false, file: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--file") args.file = argv[++i];
    else if (a.startsWith("--")) fail(`unknown option ${a}`);
    else args.text = a;
  }
  if (args.file) {
    try {
      args.text = readFileSync(args.file, "utf8");
    } catch (e) {
      fail(`cannot read ${args.file}: ${e.message}`);
    }
  }
  if (!args.text || !args.text.trim()) {
    fail('usage: objective-gate.mjs [--json] "<objective statement>"');
  }
  return args;
}

function normalize(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    try {
      const obj = JSON.parse(trimmed);
      const parts = [
        obj.objective,
        obj.audience && `for ${obj.audience}`,
        obj.behavior,
        obj.condition,
        obj.degree,
      ].filter(Boolean);
      return { text: parts.join(" "), structured: obj };
    } catch {
      fail("input looks like JSON but does not parse");
    }
  }
  return { text: trimmed, structured: null };
}

function checkObjective(text) {
  const lower = text.toLowerCase();
  const checks = [];

  // A — Audience
  const audienceHit =
    /\bfor\s+((third|second|first|fourth|fifth)[ -]?(grade|year)|[a-z][a-z'-]* (students|learners|nurses|teachers|engineers|analysts|managers|staff|employees|novices|beginners|practitioners|clinicians|developers|designers|adults|children|parents))\b/i.test(
      text
    ) ||
    /\b(students|learners|nurses|teachers|engineers|analysts|managers|staff|employees|novices|beginners|practitioners|clinicians|developers|designers|participants)\b/i.test(
      text
    );
  checks.push({
    component: "A — Audience",
    pass: audienceHit,
    detail: audienceHit
      ? "An audience is named."
      : "No audience found. State who is learning, e.g. 'for second-year nursing students'.",
  });

  // B — Behavior
  const unmeasurable = UNMEASURABLE_VERBS.filter((v) => lower.includes(v));
  const observable = OBSERVABLE_VERBS.find((v) =>
    new RegExp(`\\b${v.replace(/ /g, "\\s+")}\\b`, "i").test(text)
  );
  const behaviorPass = observable && unmeasurable.length === 0;
  checks.push({
    component: "B — Behavior",
    pass: behaviorPass,
    detail: behaviorPass
      ? `Observable verb found: "${observable}".`
      : unmeasurable.length > 0
        ? `Only unmeasurable verb(s) found (${unmeasurable.join(", ")}). Replace with an observable verb: define, classify, calculate, demonstrate, ...`
        : "No observable verb found. Use one a spectator can verify: define, list, explain, compare, calculate, demonstrate, design, ...",
  });

  // C — Condition
  const conditionHit = CONDITION_MARKERS.some((re) => re.test(text));
  checks.push({
    component: "C — Condition",
    pass: conditionHit,
    detail: conditionHit
      ? "A condition is stated."
      : "No condition found. State the circumstances, e.g. 'Given a patient case file' or 'using only the documentation'.",
  });

  // D — Degree
  const degreeHit = DEGREE_MARKERS.some((re) => re.test(text));
  checks.push({
    component: "D — Degree",
    pass: degreeHit,
    detail: degreeHit
      ? "A success criterion is stated."
      : "No degree/criterion found. State how well: 'correctly for at least 4 of 5 cases', 'within 10 minutes', 'with no errors'.",
  });

  // Learner-visible framing hint (advisory, never fails the gate)
  const learnerFraming = /\byou will be able to\b/i.test(text);
  checks.push({
    component: "Learner-visible framing (advisory)",
    pass: true,
    detail: learnerFraming
      ? "Good: the objective is phrased as what the learner will be able to do."
      : "Advisory: for the video intro, rewrite this as 'By the end of this video, you will be able to ...'.",
  });

  return checks;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { text, structured } = normalize(args.text);
  const checks = checkObjective(text);
  const passed = checks
    .filter((c) => !c.component.includes("advisory"))
    .every((c) => c.pass);

  const audience = structured?.audience ?? null;
  if (args.json) {
    console.log(
      JSON.stringify({ objective: text, audience, passed, checks }, null, 2)
    );
  } else {
    console.log(`objective-gate: ${passed ? "PASS" : "FAIL"} (GATE 1)`);
    console.log(`  Objective: ${text}\n`);
    for (const c of checks) {
      console.log(`  [${c.pass ? "ok  " : "MISS"}] ${c.component}`);
      console.log(`         ${c.detail}`);
    }
    if (!passed) {
      console.log(
        "\n  Fix the missing components and re-run. A topic is not an objective;"
      );
      console.log(
        "  the beat map, narration and QC criteria all derive from this statement."
      );
    }
  }
  process.exit(passed ? 0 : 1);
}

main();
