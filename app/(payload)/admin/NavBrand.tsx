import React from "react";

// Brand wordmark pinned to the top of the admin sidebar (above nav links).
export default function NavBrand() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "4px 12px 14px",
        marginBottom: 6,
        borderBottom: "1px solid var(--theme-elevation-100)",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          lineHeight: 1.05,
          color: "var(--theme-elevation-1000)",
        }}
      >
        Tbilisi Style <span style={{ color: "#eab308" }}>21</span>
      </div>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "var(--theme-elevation-400)",
        }}
      >
        Admin Panel
      </div>
    </div>
  );
}
