import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { StoryboardSegment, VideoProps } from "./types";
import { ChalkboardBackdrop } from "./components/ChalkboardBackdrop";
import { CaptionLayer } from "./components/CaptionLayer";
import { ChapterProgress } from "./components/ChapterProgress";
import { SceneRouter } from "./components/SceneRouter";

export const ChalkreelVideo: React.FC<VideoProps> = ({ video, segments }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#20312b" }}>
      {segments.map((seg: StoryboardSegment) => {
        const from = Math.round(seg.startSec * fps);
        const durationInFrames = Math.max(1, Math.round(seg.durationSec * fps));
        return (
          <Sequence
            key={seg.id}
            from={from}
            durationInFrames={durationInFrames}
            name={seg.title}
          >
            <SegmentScene seg={seg} backdrop={video.backdrop} />
          </Sequence>
        );
      })}
      <ChapterProgress segments={segments} />
    </AbsoluteFill>
  );
};

const SegmentScene: React.FC<{ seg: StoryboardSegment; backdrop: string }> = ({
  seg,
  backdrop,
}) => {
  return (
    <AbsoluteFill>
      <ChalkboardBackdrop variant={backdrop} />
      <SceneRouter seg={seg} />
      <CaptionLayer words={seg.words ?? []} durationSec={seg.durationSec} />
    </AbsoluteFill>
  );
};
