import React from "react";
import Link from "next/link";

// Extra links injected into the Payload admin sidebar (after the collection nav).
const links = [
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/scanner", label: "Scanner" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNavLinks() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "10px 0 6px",
        marginTop: 6,
        borderTop: "1px solid var(--theme-elevation-100)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--theme-elevation-400)",
          padding: "4px 12px",
        }}
      >
        Operations
      </div>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          style={{
            display: "block",
            padding: "8px 12px",
            borderRadius: 6,
            fontWeight: 600,
            color: "var(--theme-elevation-800)",
            textDecoration: "none",
          }}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
