import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { StoryboardSegment } from "../../types";
import { ACCENT, CHALK_FONT } from "../chalk";

/** Chalk cycle: steps in a row with loop arrows, plus a caption underneath. */
export const CycleScene: React.FC<{ seg: StoryboardSegment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const el = seg.visual.elements.find((e) => e.type === "cycle");
  const steps = el?.steps ?? [];
  const caption = seg.visual.elements.find((e) => e.type === "caption");

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 56,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {steps.map((step, i) => {
          const appear = spring({
            frame: frame - 6 - i * 22,
            fps,
            config: { damping: 14 },
          });
          return (
            <React.Fragment key={i}>
              {i > 0 ? (
                <div
                  style={{
                    fontFamily: CHALK_FONT,
                    fontSize: 52,
                    color: ACCENT,
                    opacity: appear,
                  }}
                >
                  ⟳
                </div>
              ) : null}
              <div
                style={{
                  fontFamily: CHALK_FONT,
                  fontSize: 44,
                  fontWeight: 700,
                  color: "#f4f1e8",
                  border: `4px solid ${ACCENT}`,
                  borderRadius: 16,
                  padding: "26px 34px",
                  maxWidth: 380,
                  textAlign: "center",
                  opacity: appear,
                }}
              >
                {step}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {caption ? (
        <div
          style={{
            fontFamily: CHALK_FONT,
            fontSize: 58,
            color: ACCENT,
            fontWeight: 700,
          }}
        >
          {caption.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
