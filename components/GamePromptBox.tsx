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
    <section className="rounded-xl bg-surface-container p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
            Quick Game Pick
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">Tell us what you feel like playing.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "co-op deckbuilder with sci-fi"'
          className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-1 focus:ring-primary"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="font-label shrink-0 rounded-lg bg-primary px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-primary transition-all hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

      {data ? (
        <div className="obsidian-glass mt-4 rounded-xl border border-outline-variant/20 p-4">
          <p className="font-label text-xs uppercase tracking-widest text-primary">Suggestion</p>
          <p className="mt-2 text-sm text-on-surface-variant">{data.answer}</p>
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

