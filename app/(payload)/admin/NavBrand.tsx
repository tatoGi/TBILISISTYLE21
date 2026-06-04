import React from "react";
import Link from "next/link";

export default function NavBrand() {
  return (
    <Link
      href="/admin"
      style={{
        alignItems: "center",
        color: "inherit",
        display: "flex",
        gap: 10,
        margin: "4px 10px 14px",
        padding: "12px 10px 16px",
        borderBottom: "1px solid var(--theme-elevation-100)",
        textDecoration: "none",
      }}
    >
      <span
        style={{
          alignItems: "center",
          background: "#405189",
          borderRadius: 8,
          color: "#fff",
          display: "grid",
          fontSize: 14,
          fontWeight: 900,
          height: 34,
          justifyContent: "center",
          width: 34,
        }}
      >
        TS
      </span>
      <span style={{ display: "grid", gap: 1, minWidth: 0 }}>
        <span
          style={{
            color: "var(--theme-elevation-1000)",
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: "0.01em",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          Tbilisi Style 21
        </span>
        <span
          style={{
            color: "var(--theme-elevation-400)",
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          Admin Panel
        </span>
      </span>
    </Link>
  );
}
