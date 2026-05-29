"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm({
  configured,
  initialError,
}: {
  configured: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await response.json().catch(() => null)) as {
      token?: string;
      error?: string;
    } | null;

    if (!response.ok || !data?.token) {
      setError(data?.error || "login");
      setLoading(false);
      return;
    }

    localStorage.setItem("accessToken", data.token);
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-md gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50"
      >
        <div className="grid gap-3">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-400 text-base font-black text-slate-900">
            TS
          </span>
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600">
              Tbilisi Style 21
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              Admin Sign in
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter the admin password to continue.
            </p>
          </div>
        </div>

        {!configured ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            ADMIN_PASSWORD is not configured yet. Set it in .env.local before
            signing in.
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Password is incorrect or the session has expired.
          </p>
        ) : null}

        <label className="grid gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Password
          </span>
          <input
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          disabled={loading || !configured}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
