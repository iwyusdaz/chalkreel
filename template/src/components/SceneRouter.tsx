import React from "react";
import type { StoryboardSegment } from "../types";
import { StatementScene } from "./scenes/StatementScene";
import { DefinitionScene } from "./scenes/DefinitionScene";
import { TimelineScene } from "./scenes/TimelineScene";
import { CycleScene } from "./scenes/CycleScene";
import { ListScene } from "./scenes/ListScene";

/**
 * Routes a storyboard segment to its code-drawn scene component by
 * sceneKind. Unknown kinds fall back to StatementScene with the first
 * on-screen text so a malformed storyboard still renders something honest.
 */
export const SceneRouter: React.FC<{ seg: StoryboardSegment }> = ({ seg }) => {
  switch (seg.sceneKind) {
    case "statement":
      return <StatementScene seg={seg} />;
    case "definition":
      return <DefinitionScene seg={seg} />;
    case "timeline":
      return <TimelineScene seg={seg} />;
    case "cycle":
      return <CycleScene seg={seg} />;
    case "list":
      return <ListScene seg={seg} />;
    default:
      return <StatementScene seg={seg} />;
  }
};
