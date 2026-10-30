import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { StoryboardSegment } from "../../types";
import { ACCENT, CHALK_FONT } from "../chalk";

/** Big chalk statement with a hand-drawn underline that draws itself on. */
export const StatementScene: React.FC<{ seg: StoryboardSegment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text =
    seg.visual.elements.find((e) => e.type === "headline")?.text ??
    seg.visual.onScreenText[0] ??
    seg.title;
  const pop = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const draw = interpolate(frame, [10, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: pop,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: CHALK_FONT,
            fontSize: 96,
            fontWeight: 700,
            color: "#f4f1e8",
            textShadow: "0 0 1px rgba(255,255,255,0.4)",
          }}
        >
          {text}
        </div>
        <svg width={640} height={26} style={{ marginTop: 10 }}>
          <path
            d="M 8 14 C 160 6, 480 20, 632 10"
            stroke={ACCENT}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={700}
            strokeDashoffset={700 - draw * 700}
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
