import React from "react";
import { Composition } from "remotion";
import type { AnyZodObject } from "zod";
import { ChalkreelVideo } from "./ChalkreelVideo";
import type { VideoProps } from "./types";
import videoData from "./video.json";

// The sample project ships as defaultProps; swap in your own storyboard JSON.
const props = videoData as unknown as VideoProps;

export const RemotionRoot: React.FC = () => {
  const totalSec = props.segments.reduce(
    (acc, s) => Math.max(acc, s.startSec + s.durationSec),
    0
  );
  const fps = props.video.fps;

  return (
    <Composition<AnyZodObject, VideoProps>
      id="ChalkreelVideo"
      component={ChalkreelVideo}
      durationInFrames={Math.ceil(totalSec * fps)}
      fps={fps}
      width={props.video.width}
      height={props.video.height}
      defaultProps={props}
      calculateMetadata={({ props: p }) => {
        const t = p.segments.reduce(
          (acc, s) => Math.max(acc, s.startSec + s.durationSec),
          0
        );
        return {
          durationInFrames: Math.ceil(t * p.video.fps),
          fps: p.video.fps,
          width: p.video.width,
          height: p.video.height,
        };
      }}
    />
  );
};
