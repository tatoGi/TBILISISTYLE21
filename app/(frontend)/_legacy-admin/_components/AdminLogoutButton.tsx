"use client";

import { logoutAdmin } from "../actions";

export function AdminLogoutButton() {
  return (
    <form
      action={logoutAdmin}
      onSubmit={() => {
        localStorage.removeItem("accessToken");
      }}
    >
      <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </button>
    </form>
  );
}
