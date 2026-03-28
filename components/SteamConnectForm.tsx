"use client";

import { useState } from "react";

type Props = {
  onConnected: () => void;
};

export function SteamConnectForm({ onConnected }: Props) {
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

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-surface-container-low p-6 ring-1 ring-outline-variant/20">
      <h3 className="text-xl font-bold text-primary">Connect your Steam profile</h3>
      <p className="text-sm text-on-surface-variant">
        Paste your Steam profile URL or 17-digit Steam ID.
      </p>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="https://steamcommunity.com/profiles/7656119..."
        className="w-full rounded-lg bg-surface-container-lowest px-4 py-3 outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
        required
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container transition hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Connecting..." : "Connect Steam"}
      </button>
    </form>
  );
}
