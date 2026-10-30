// Shared types for the chalkreel template. These mirror the storyboard JSON
// format documented in skill/SKILL.md.

export interface WordTiming {
  w: string;
  start: number;
  end: number;
}

export type SceneKind =
  | "statement"
  | "definition"
  | "timeline"
  | "cycle"
  | "list"
  | "caption";

export interface SceneElement {
  type: string;
  desc?: string;
  text?: string;
  term?: string;
  definition?: string;
  inLabel?: string;
  outLabel?: string;
  label?: string;
  year?: string;
  items?: TimelineItem[] | string[];
  steps?: string[];
}

export interface TimelineItem {
  year: string;
  label: string;
}

export interface StoryboardSegment {
  id: string;
  title: string;
  sceneKind: SceneKind;
  startSec: number;
  durationSec: number;
  narration: string;
  visual: {
    backdrop: string;
    description: string;
    elements: SceneElement[];
    onScreenText: string[];
  };
  audioDescriptionNote: string;
  claims: string[];
  /** optional word timings merged in from the TTS alignment step */
  words?: WordTiming[];
}

export interface VideoProps extends Record<string, unknown> {
  video: {
    title: string;
    language: string;
    fps: number;
    width: number;
    height: number;
    backdrop: string;
    note?: string;
  };
  segments: StoryboardSegment[];
}
