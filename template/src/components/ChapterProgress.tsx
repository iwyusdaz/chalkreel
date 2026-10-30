import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { StoryboardSegment } from "../types";

/** Chapter progress bar: shows elapsed time and a tick per segment. */
export const ChapterProgress: React.FC<{ segments: StoryboardSegment[] }> = ({
  segments,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const total = segments.reduce(
    (acc, s) => Math.max(acc, s.startSec + s.durationSec),
    0
  );
  const t = frame / fps;
  const pct = Math.min(1, t / total);

  const barWidth = Math.min(720, width * 0.4);
  const barHeight = 8;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 44,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: barWidth,
          height: barHeight,
          borderRadius: 4,
          background: "rgba(255,255,255,0.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct * 100}%`,
            borderRadius: 4,
            background: "#FFC66D",
          }}
        />
        {segments.map((s) => {
          const at = (s.startSec / total) * barWidth;
          return (
            <div
              key={s.id}
              title={s.title}
              style={{
                position: "absolute",
                left: at,
                top: -3,
                width: 2,
                height: barHeight + 6,
                background: "rgba(255,255,255,0.55)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
