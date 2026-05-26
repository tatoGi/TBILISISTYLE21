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
      <button className="border border-white/20 px-4 py-3 text-xs font-bold uppercase text-white/70 transition hover:border-white hover:text-white">
        Logout
      </button>
    </form>
  );
}
