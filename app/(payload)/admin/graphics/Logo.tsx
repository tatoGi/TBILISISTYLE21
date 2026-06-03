import React from "react";

// Brand wordmark — compact so it fits the sidebar header without clipping,
// while still reading well on the login screen.
export default function Logo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        lineHeight: 1.05,
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          fontSize: 19,
          fontWeight: 900,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        Tbilisi Style <span style={{ color: "#facc15" }}>21</span>
      </div>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          opacity: 0.5,
        }}
      >
        Admin Panel
      </div>
    </div>
  );
}
