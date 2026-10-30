import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { StoryboardSegment } from "../../types";
import { ACCENT, CHALK_FONT } from "../chalk";

/** Numbered chalk list revealed item by item. */
export const ListScene: React.FC<{ seg: StoryboardSegment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const el = seg.visual.elements.find((e) => e.type === "list");
  const items = (el?.items as string[] | undefined) ?? [];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "flex-start",
        paddingLeft: "18%",
        gap: 34,
      }}
    >
      {items.map((item, i) => {
        const appear = spring({
          frame: frame - 6 - i * 30,
          fps,
          config: { damping: 14 },
        });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              opacity: appear,
              transform: `translateX(${(1 - appear) * 40}px)`,
            }}
          >
            <div
              style={{
                fontFamily: CHALK_FONT,
                fontSize: 56,
                fontWeight: 700,
                color: ACCENT,
              }}
            >
              {i + 1}.
            </div>
            <div
              style={{
                fontFamily: CHALK_FONT,
                fontSize: 60,
                color: "#f4f1e8",
                fontWeight: 700,
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
