import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { StoryboardSegment, TimelineItem } from "../../types";
import { ACCENT, CHALK_FONT } from "../chalk";

/**
 * Chalk timeline: dots on a hand-drawn line, year above the dot, label below
 * it. Fixed vertical layout keeps the line clear of the label text (spatial
 * contiguity: labels sit next to, never on top of, the element they describe).
 */
export const TimelineScene: React.FC<{ seg: StoryboardSegment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const el = seg.visual.elements.find((e) => e.type === "timeline");
  const items = (el?.items as TimelineItem[] | undefined) ?? [];
  const lineW = Math.min(1360, width * 0.72);

  // Vertical layout (px, within the 340px-tall stage)
  const YEAR_TOP = 0;
  const DOT_TOP = 128; // dot center = 128 + 11 = 139
  const LABEL_TOP = 172;
  const LINE_Y = 139;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: lineW, height: 340 }}>
        <svg
          width={lineW}
          height={340}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <path
            d={`M 10 ${LINE_Y + 2} C ${lineW * 0.33} ${LINE_Y - 5}, ${lineW * 0.66} ${LINE_Y + 6}, ${lineW - 10} ${LINE_Y - 1}`}
            stroke="rgba(244,241,232,0.85)"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        {items.map((item, i) => {
          const appear = spring({
            frame: frame - 8 - i * 26,
            fps,
            config: { damping: 13 },
          });
          const x = (lineW / (items.length + 1)) * (i + 1);
          const rise = interpolate(appear, [0, 1], [18, 0]);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - 130,
                top: 0,
                width: 260,
                textAlign: "center",
                opacity: appear,
                transform: `translateY(${rise}px)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: YEAR_TOP,
                  left: 0,
                  right: 0,
                  fontFamily: CHALK_FONT,
                  fontSize: 64,
                  fontWeight: 700,
                  color: ACCENT,
                }}
              >
                {item.year}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: DOT_TOP,
                  left: 119,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: ACCENT,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: LABEL_TOP,
                  left: 0,
                  right: 0,
                  fontFamily: CHALK_FONT,
                  fontSize: 34,
                  lineHeight: 1.3,
                  color: "#f4f1e8",
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
