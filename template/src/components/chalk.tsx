import React from "react";

/** Shared chalk-style text and colors for all scene components. */
export const CHALK = "#f4f1e8";
export const ACCENT = "#FFC66D";
export const CHALK_FONT =
  "'Chalkboard SE', 'Comic Sans MS', 'Segoe Print', cursive, sans-serif";

export const ChalkText: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number | string;
  style?: React.CSSProperties;
}> = ({ children, size = 72, color = CHALK, weight = 700, style }) => (
  <div
    style={{
      fontFamily: CHALK_FONT,
      fontSize: size,
      color,
      fontWeight: weight,
      textShadow: "0 0 1px rgba(255,255,255,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);
