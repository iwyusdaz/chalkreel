import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { WordTiming } from "../types";

/**
 * Word-aligned caption layer. Cues are built from the per-word timestamps in
 * the timing JSON: a cue is one sentence, displayed while its words are being
 * spoken, with the active word emphasized. This mirrors the SRT emitted by
 * skill/scripts/make-srt.mjs so burned captions and the .srt never disagree.
 */

interface Cue {
  words: WordTiming[];
  start: number;
  end: number;
}

function buildCues(words: WordTiming[]): Cue[] {
  const cues: Cue[] = [];
  let cur: WordTiming[] = [];
  for (const w of words) {
    cur.push(w);
    if (/[.!?]$/.test(w.w)) {
      cues.push({
        words: cur,
        start: cur[0].start,
        end: cur[cur.length - 1].end,
      });
      cur = [];
    }
  }
  if (cur.length > 0) {
    cues.push({
      words: cur,
      start: cur[0].start,
      end: cur[cur.length - 1].end,
    });
  }
  return cues;
}

const PALETTE = {
  idle: "rgba(255,255,255,0.62)",
  active: "#ffffff",
  plate: "rgba(0,0,0,0.45)",
};

export const CaptionLayer: React.FC<{
  words: WordTiming[];
  durationSec: number;
}> = ({ words, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  if (words.length === 0) return null;
  const cues = buildCues(words);
  // Hold the last cue until the segment ends.
  const cue =
    cues.find((c) => t >= c.start - 0.05 && t <= c.end + 0.35) ??
    (t > (cues[cues.length - 1]?.end ?? 0) ? cues[cues.length - 1] : null);
  if (!cue) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 110,
        display: "flex",
        justifyContent: "center",
        padding: "0 12%",
      }}
    >
      <div
        style={{
          background: PALETTE.plate,
          borderRadius: 10,
          padding: "14px 26px",
          fontFamily:
            "'Chalkboard SE', 'Comic Sans MS', 'Segoe Print', sans-serif",
          fontSize: 40,
          lineHeight: 1.35,
          textAlign: "center",
          maxWidth: "100%",
        }}
      >
        {cue.words.map((w, i) => {
          const spoken = t >= w.start && t <= Math.max(w.end, w.start + 0.05);
          return (
            <span
              key={i}
              style={{
                color: spoken ? PALETTE.active : PALETTE.idle,
                fontWeight: spoken ? 700 : 400,
                marginRight: 10,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
