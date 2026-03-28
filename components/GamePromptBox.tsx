"use client";

import { useMemo, useState } from "react";

type BlacklistItem = { id: number; game_name: string };

type GameSuggestion = {
  title: string;
  genre?: string;
  reason?: string;
};

type ApiResponse = {
  answer: string;
  game?: GameSuggestion;
};

export function GamePromptBox({
  blacklist
}: {
  blacklist: BlacklistItem[];
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  const blacklistNames = useMemo(
    () => blacklist.map((b) => b.game_name).filter(Boolean).slice(0, 30),
    [blacklist]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/openrouter-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          blacklist: blacklistNames
        })
      });

      const payload: unknown = await response.json();
      if (!response.ok) {
        const msg =
          typeof payload === "object" && payload && "error" in payload
            ? String((payload as { error?: unknown }).error ?? "Request failed.")
            : "Request failed.";
        setError(msg);
        return;
      }

      setData(payload as ApiResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl bg-surface-container-low p-4 ring-1 ring-outline-variant/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-primary">Quick Game Pick</h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            Tell us what you feel like playing.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "co-op deckbuilder with sci-fi"'
          className="w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-sm outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary-container px-3 py-2 text-sm font-semibold text-on-primary-container disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

      {data ? (
        <div className="mt-3 rounded-xl bg-surface-container-lowest p-3 ring-1 ring-outline-variant/20">
          <p className="text-sm font-semibold text-primary">Suggestion</p>
          <p className="mt-1 text-sm text-on-surface-variant">{data.answer}</p>
          {data.game?.title ? (
            <p className="mt-2 text-sm">
              <span className="font-semibold text-primary">Game:</span>{" "}
              <span className="text-on-surface-variant">{data.game.title}</span>
            </p>
          ) : null}
          {data.game?.reason ? (
            <p className="mt-1 text-sm text-on-surface-variant">
              {data.game.reason}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

