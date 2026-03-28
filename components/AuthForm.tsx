"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Supabase configuration missing.");
      setLoading(false);
      return;
    }

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md rounded-2xl bg-surface-container-low p-8 ring-1 ring-outline-variant/20"
    >
      <h1 className="text-3xl font-black text-primary">
        {mode === "login" ? "Log in" : "Sign up"}
      </h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        {mode === "login" ? "Welcome back to Playrift." : "Create your Playrift account."}
      </p>

      <div className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg bg-surface-container-lowest px-4 py-3 outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-lg bg-surface-container-lowest px-4 py-3 outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <button
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-primary-container py-3 font-semibold text-on-primary-container hover:opacity-95 disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </button>
    </form>
  );
}
