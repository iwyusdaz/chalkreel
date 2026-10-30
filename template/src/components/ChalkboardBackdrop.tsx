import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * The chalkboard backdrop: deep slate-green board, deterministic chalk-dust
 * texture (SVG feTurbulence — no image assets, renders identically on every
 * machine), and a soft vignette. One backdrop style per the brief; the
 * variant prop exists so a GATE 3 bake-off can add `paper` and `night`.
 */

const VARIANTS: Record<string, { base: string; tint: string; vignette: string }> = {
  chalkboard: {
    base: "linear-gradient(160deg, #26382f 0%, #20312b 55%, #1a2822 100%)",
    tint: "#1d2c26",
    vignette: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.42) 100%)",
  },
  paper: {
    base: "linear-gradient(160deg, #f7f2e7 0%, #f2ecdd 100%)",
    tint: "#efe8d6",
    vignette: "radial-gradient(ellipse at center, transparent 60%, rgba(90,70,40,0.18) 100%)",
  },
  night: {
    base: "linear-gradient(160deg, #101418 0%, #0b0e12 100%)",
    tint: "#0d1116",
    vignette: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
  },
};

export const ChalkboardBackdrop: React.FC<{ variant?: string }> = ({
  variant = "chalkboard",
}) => {
  const frame = useCurrentFrame();
  const v = VARIANTS[variant] ?? VARIANTS.chalkboard;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: v.base }} />
      {/* chalk dust texture: two turbulence layers, subtly different scales */}
      <AbsoluteFill>
        <svg width="100%" height="100%" style={{ opacity: 0.16 }}>
          <filter id="chalk-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves={2}
              seed={7}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#chalk-noise)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill>
        <svg width="100%" height="100%" style={{ opacity: 0.07 }}>
          <filter id="smudge">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves={3}
              seed={19}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#smudge)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: v.vignette }} />
      {/* invisible but keeps the frame counter referenced for lint parity */}
      <span style={{ display: "none" }}>{frame}</span>
    </AbsoluteFill>
  );
};
