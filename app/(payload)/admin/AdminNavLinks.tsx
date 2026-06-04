import React from "react";
import Link from "next/link";

const groups = [
  {
    title: "Content",
    links: [
      { href: "/admin/pages", label: "Pages", icon: "Pg" },
      { href: "/admin/news", label: "News", icon: "N" },
      { href: "/admin/media", label: "Media", icon: "M" },
      { href: "/admin/menu", label: "Menu", icon: "Mn" },
    ],
  },
  {
    title: "Catalog",
    links: [
      { href: "/admin/tickets", label: "Ticket Types", icon: "T" },
      { href: "/admin/products", label: "Products", icon: "P" },
    ],
  },
  {
    title: "Operations",
    links: [
      { href: "/admin/sold-tickets", label: "Sold Tickets", icon: "S" },
      { href: "/admin/product-orders", label: "Product Orders", icon: "O" },
      { href: "/admin/joker-tickets", label: "Joker Tickets", icon: "J" },
      { href: "/admin/emails", label: "Email Queue", icon: "E" },
      { href: "/admin/activity", label: "Activity", icon: "A" },
      { href: "/admin/scanner", label: "Scanner", icon: "Q" },
      { href: "/admin/settings", label: "Settings", icon: "C" },
    ],
  },
  {
    title: "System",
    links: [{ href: "/admin/users", label: "Users", icon: "U" }],
  },
];

export default function AdminNavLinks() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--theme-elevation-100)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        margin: "10px 8px 6px",
        paddingTop: 14,
      }}
    >
      {groups.map((group) => (
        <div key={group.title} style={{ display: "grid", gap: 4 }}>
          <div
            style={{
              color: "var(--theme-elevation-400)",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              padding: "4px 10px",
              textTransform: "uppercase",
            }}
          >
            {group.title}
          </div>
          {group.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                alignItems: "center",
                borderRadius: 8,
                color: "var(--theme-elevation-800)",
                display: "flex",
                fontWeight: 700,
                gap: 10,
                padding: "9px 10px",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  alignItems: "center",
                  background: "var(--theme-elevation-100)",
                  borderRadius: 6,
                  color: "var(--theme-elevation-600)",
                  display: "grid",
                  fontSize: 10,
                  fontWeight: 900,
                  height: 22,
                  justifyContent: "center",
                  width: 22,
                }}
              >
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </div>
      ))}

      {/* Always-visible logout. `prefetch={false}` so hovering doesn't prefetch
          the logout route (which would end the session). */}
      <Link
        href="/admin/logout"
        prefetch={false}
        style={{
          alignItems: "center",
          borderRadius: 8,
          color: "var(--theme-error-500, #e11d48)",
          display: "flex",
          fontWeight: 800,
          gap: 10,
          marginTop: 6,
          padding: "9px 10px",
          textDecoration: "none",
        }}
      >
        <span
          style={{
            alignItems: "center",
            background: "var(--theme-error-100, rgba(225,29,72,0.12))",
            borderRadius: 6,
            color: "var(--theme-error-500, #e11d48)",
            display: "grid",
            fontSize: 10,
            fontWeight: 900,
            height: 22,
            justifyContent: "center",
            width: 22,
          }}
        >
          ⎋
        </span>
        Log out
      </Link>
    </div>
  );
}
