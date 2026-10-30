#!/usr/bin/env node
/**
 * chalkreel make-transcript
 *
 * Generates an accessible transcript HTML page from the timing JSON and the
 * storyboard JSON. The transcript is a first-class deliverable of the
 * pipeline: e-learning teams shipping to an LMS need it, and WCAG 2.1
 * (1.2.1 Audio-only / 1.2.3, 1.2.5) expects an alternative for
 * time-based media.
 *
 * Accessibility features of the generated page (WCAG 2.1 AA design targets):
 *   - lang attribute, one h1, logical heading order
 *   - <time> elements with readable timecodes per segment
 *   - "On screen" descriptions from the storyboard (serves low-vision users
 *     and doubles as audio-description notes)
 *   - high-contrast inline CSS, 320px-safe reflow, no motion
 *
 * Usage:
 *   node make-transcript.mjs --timing <timing.json> [--storyboard <storyboard.json>]
 *                            [--out transcript.html] [--title "..."] [--lang en]
 *                            [--source-label "..."]
 */

import { readFileSync, writeFileSync } from "node:fs";

function fail(msg) {
  console.error(`make-transcript: ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const args = {
    timing: null,
    storyboard: null,
    out: null,
    title: null,
    lang: "en",
    sourceLabel: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--timing") args.timing = argv[++i];
    else if (a === "--storyboard") args.storyboard = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--title") args.title = argv[++i];
    else if (a === "--lang") args.lang = argv[++i];
    else if (a === "--source-label") args.sourceLabel = argv[++i];
    else if (a.startsWith("--")) fail(`unknown option ${a}`);
    else fail(`unexpected argument ${a}`);
  }
  if (!args.timing) fail("--timing is required");
  return args;
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  let timing, storyboard = null;
  try {
    timing = JSON.parse(readFileSync(args.timing, "utf8"));
  } catch (e) {
    fail(`cannot read timing JSON: ${e.message}`);
  }
  if (args.storyboard) {
    try {
      storyboard = JSON.parse(readFileSync(args.storyboard, "utf8"));
    } catch (e) {
      fail(`cannot read storyboard JSON: ${e.message}`);
    }
  }

  const title =
    args.title ||
    (timing.video && timing.video.title) ||
    (storyboard && storyboard.video && storyboard.video.title) ||
    "Video transcript";
  const sbSegs = new Map(
    (storyboard && storyboard.segments
      ? storyboard.segments
      : []
    ).map((s) => [s.id, s])
  );
  const note =
    timing.note ||
    (storyboard && storyboard.note) ||
    null;

  const segsHtml = timing.segments
    .map((seg) => {
      const sb = sbSegs.get(seg.id) || {};
      const st = typeof seg.start === "number" ? seg.start : 0;
      const onScreen = sb.visual && sb.visual.onScreenText
        ? sb.visual.onScreenText
        : null;
      const visualDesc = sb.visual && sb.visual.description
        ? sb.visual.description
        : null;
      const adNote = sb.audioDescriptionNote || null;
      const claims = Array.isArray(sb.claims) && sb.claims.length
        ? sb.claims
        : null;

      return `  <section class="seg" id="${esc(seg.id)}">
    <h2>${esc(sb.title || seg.id)} <time datetime="${fmtTime(st)}">${fmtTime(st)}</time></h2>
    <p class="narration">${esc(seg.text)}</p>
    ${visualDesc ? `    <p class="meta"><strong>Visual:</strong> ${esc(visualDesc)}</p>\n` : ""}${onScreen ? `    <p class="meta"><strong>On screen:</strong> ${onScreen.map(esc).join(" · ")}</p>\n` : ""}${adNote ? `    <p class="meta"><strong>Audio description:</strong> ${esc(adNote)}</p>\n` : ""}${claims ? `    <p class="meta"><strong>Claims in this segment:</strong> ${claims.map(esc).join(", ")}</p>\n` : ""}  </section>`;
    })
    .join("\n");

  const fullText = timing.segments.map((s) => s.text).join(" ");

  const html = `<!DOCTYPE html>
<html lang="${esc(args.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Transcript: ${esc(title)}</title>
<style>
  :root { color-scheme: light; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    line-height: 1.6;
    max-width: 46rem;
    margin: 0 auto;
    padding: 1.25rem;
    color: #1b1b1b;
    background: #ffffff;
  }
  h1 { font-size: 1.6rem; line-height: 1.25; margin: 0 0 0.5rem; }
  h2 { font-size: 1.1rem; margin: 1.75rem 0 0.35rem; }
  h2 time { font-weight: 400; color: #555; font-variant-numeric: tabular-nums; }
  .narration { margin: 0.25rem 0; }
  .meta { font-size: 0.92rem; color: #444; margin: 0.3rem 0; }
  .notice {
    background: #f2f6ff;
    border: 1px solid #b9c8ee;
    border-radius: 6px;
    padding: 0.6rem 0.9rem;
    font-size: 0.92rem;
  }
  .seg { border-top: 1px solid #ddd; }
  .seg:first-of-type { border-top: 0; }
  a { color: #0b45a0; }
  @media (max-width: 480px) { body { padding: 0.9rem; } }
</style>
</head>
<body>
<main>
<h1>${esc(title)} — transcript</h1>
<p>This page is the text alternative for the video. It includes the full
narration with timecodes, what appears on screen in each segment, and the
audio-description notes.</p>
${note ? `<p class="notice">${esc(note)}</p>` : ""}
${args.sourceLabel ? `<p class="meta">Source: ${esc(args.sourceLabel)}</p>` : ""}
${segsHtml}
<section>
  <h2>Full text</h2>
  <p>${esc(fullText)}</p>
</section>
</main>
</body>
</html>
`;

  if (args.out) {
    writeFileSync(args.out, html, "utf8");
    console.log(
      `make-transcript: wrote ${timing.segments.length} segments -> ${args.out}`
    );
  } else {
    process.stdout.write(html);
  }
}

main();
