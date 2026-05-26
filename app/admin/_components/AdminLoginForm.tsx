"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function LoginField({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-white/80">
      {label}
      <input
        className="h-11 border border-white/15 bg-white/10 px-3 text-white outline-none transition focus:border-yellow-300"
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

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
    <main className="grid min-h-screen place-items-center bg-black px-5 text-white">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-sm gap-5 border border-white/10 p-6"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
            Tbilisi Style 21
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase">Admin</h1>
        </div>

        {!configured ? (
          <p className="border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">
            ADMIN_PASSWORD is not configured yet.
          </p>
        ) : null}

        {error ? (
          <p className="border border-yellow-300/40 bg-yellow-300/10 p-3 text-sm text-yellow-100">
            Password is incorrect or the session has expired.
          </p>
        ) : null}

        <LoginField
          label="Password"
          name="password"
          type="password"
          required
          value={password}
          onChange={setPassword}
        />
        <button
          className="h-11 bg-yellow-300 px-5 text-sm font-black uppercase text-black transition hover:bg-white disabled:opacity-60"
          disabled={loading || !configured}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
