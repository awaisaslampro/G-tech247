"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message || "Invalid password.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Enter admin password to access applicant dashboard.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Password
            <input
              className="h-11 rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-brand-500"
              name="password"
              required
              type="password"
            />
          </label>
          <button
            className="inline-flex h-11 items-center rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
        </form>
      </div>
    </main>
  );
}
