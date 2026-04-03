"use client";

import { useState } from "react";

type Props = {
  onConnected: () => void;
  /** Use inside a parent surface card (no outer chrome). */
  embedded?: boolean;
};

export function SteamConnectForm({ onConnected, embedded }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/steam/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamInput: input })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to connect Steam profile.");
      onConnected();
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  const shell = embedded
    ? "space-y-3 text-left"
    : "space-y-3 rounded-xl border border-outline-variant/20 bg-surface-container-low p-6";

  return (
    <form onSubmit={onSubmit} className={shell}>
      {embedded ? (
        <>
          <span className="material-symbols-outlined mb-2 block text-center text-4xl text-tertiary">
            bolt
          </span>
          <h3 className="text-center text-xl font-black text-on-surface">Link Steam</h3>
          <p className="text-center text-xs text-on-surface-variant">
            Paste your profile URL (custom /id/… or profiles link) or 17-digit Steam ID.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold text-primary">Connect your Steam profile</h3>
          <p className="text-sm text-on-surface-variant">
            Paste your Steam profile URL (including custom /id/… links) or 17-digit Steam ID.
          </p>
        </>
      )}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="https://steamcommunity.com/id/your-name or /profiles/7656119…"
        className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-sm outline-none ring-1 ring-transparent transition focus:ring-1 focus:ring-primary"
        required
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container transition hover:bg-[#8083ff]/90 hover:shadow-[0_0_15px_rgba(192,193,255,0.3)] disabled:opacity-50"
      >
        {loading ? "Connecting..." : "Connect Steam"}
      </button>
    </form>
  );
}
