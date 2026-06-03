import React from "react";

// Header brand mark — full wordmark (not just "TS").
export default function Icon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        fontSize: 14,
        fontWeight: 900,
        letterSpacing: "0.01em",
        textTransform: "uppercase",
        lineHeight: 1,
        color: "var(--theme-elevation-1000)",
      }}
    >
      Tbilisi&nbsp;Style&nbsp;<span style={{ color: "#eab308" }}>21</span>
    </span>
  );
}
