"use client";

import { useState } from "react";

type Props = {
  onDisconnected: () => void;
};

export function SteamConnectedCard({ onDisconnected }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function disconnect() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/steam/disconnect", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not disconnect Steam.");
      onDisconnected();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl bg-surface-container-low p-6 ring-1 ring-outline-variant/20">
      <h3 className="text-xl font-bold text-primary">Steam profile linked</h3>
      <p className="text-sm text-on-surface-variant">
        Your library is used for recommendations. You can unlink Steam anytime and connect a different profile
        later.
      </p>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="button"
        onClick={disconnect}
        disabled={loading}
        className="rounded-lg bg-surface-container-lowest px-5 py-2.5 text-sm font-semibold text-on-surface outline-none ring-1 ring-outline-variant/40 transition hover:bg-surface-container disabled:opacity-50"
      >
        {loading ? "Disconnecting..." : "Disconnect Steam"}
      </button>
    </div>
  );
}
