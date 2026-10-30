import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { StoryboardSegment } from "../../types";
import { ACCENT, CHALK_FONT } from "../chalk";

/** Term + definition, with the IN/OUT chalk arrows when present. */
export const DefinitionScene: React.FC<{ seg: StoryboardSegment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const def = seg.visual.elements.find((e) => e.type === "definition");
  const arrows = seg.visual.elements.find((e) => e.type === "arrow-in-out");
  const termPop = spring({ frame, fps, config: { damping: 14 } });
  const bodyPop = spring({ frame: frame - 14, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 36,
        paddingLeft: "8%",
        paddingRight: "8%",
      }}
    >
      <div
        style={{
          fontFamily: CHALK_FONT,
          fontSize: 84,
          fontWeight: 700,
          color: ACCENT,
          opacity: termPop,
        }}
      >
        {def?.term ?? seg.title}
      </div>
      <div
        style={{
          fontFamily: CHALK_FONT,
          fontSize: 54,
          color: "#f4f1e8",
          opacity: bodyPop,
          textAlign: "center",
        }}
      >
        {def?.definition ?? seg.visual.onScreenText[0] ?? ""}
      </div>
      {arrows ? (
        <div
          style={{
            display: "flex",
            gap: 80,
            alignItems: "center",
            opacity: bodyPop,
          }}
        >
          <div
            style={{
              fontFamily: CHALK_FONT,
              fontSize: 40,
              color: "rgba(244,241,232,0.75)",
            }}
          >
            → {arrows.inLabel ?? ""}
          </div>
          <div
            style={{
              fontFamily: CHALK_FONT,
              fontSize: 48,
              fontWeight: 700,
              color: ACCENT,
            }}
          >
            ← {arrows.outLabel ?? ""}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
