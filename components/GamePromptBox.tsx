"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type BlacklistItem = { id: number; game_name: string };

type GamePayload = {
  title: string;
  genre?: string;
  reason?: string;
};

type DisplayPayload = {
  slug: string;
  name: string;
  background_image: string | null;
  genres: string[];
  algorithm_reason: string;
  brief_detail: string;
  released?: string | null;
  released_display?: string | null;
};

type RecencyFlags = {
  recency_prompt?: boolean;
  recency_months_used?: number | null;
  recency_relaxed_newest_dated?: boolean;
  recency_relaxed_full_pool?: boolean;
  rawg_ordering_released?: boolean;
};

type ApiResponse = {
  answer: string;
  insight?: string;
  flags?: RecencyFlags;
  game?: GamePayload;
  display?: DisplayPayload;
};

export function GamePromptBox({
  blacklist
}: {
  blacklist: BlacklistItem[];
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [excludeTitles, setExcludeTitles] = useState<string[]>([]);

  const blacklistNames = useMemo(
    () => blacklist.map((b) => b.game_name).filter(Boolean).slice(0, 30),
    [blacklist]
  );

  async function runRequest(mode: "fresh" | "regenerate") {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setErrorCode(null);
    if (mode === "fresh") setData(null);

    const exclusions = mode === "regenerate" ? excludeTitles : [];

    try {
      const response = await fetch("/api/openrouter-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          blacklist: blacklistNames,
          excludeTitles: exclusions,
          regenerate: mode === "regenerate"
        })
      });

      const payload: unknown = await response.json();
      if (!response.ok) {
        const errObj = payload as { error?: unknown; code?: string };
        const msg =
          typeof errObj.error === "string" ? errObj.error : "Request failed.";
        setError(msg);
        if (typeof errObj.code === "string") setErrorCode(errObj.code);
        return;
      }

      const ok = payload as ApiResponse;
      setData(ok);

      const picked = ok.display?.name ?? ok.game?.title;
      if (picked) {
        if (mode === "regenerate") {
          setExcludeTitles((prev) => (prev.includes(picked) ? prev : [...prev, picked]));
        } else {
          setExcludeTitles([picked]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    void runRequest("fresh");
  }

  const display = data?.display;
  const imageSrc = display?.background_image;

  return (
    <section className="rounded-xl bg-surface-container p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
            Quick Game Pick
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Blends your <span className="font-semibold text-on-surface">Rift algorithm</span> with what
            you feel like playing right now.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "something short and cozy for tonight"'
          className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-1 focus:ring-primary"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="font-label shrink-0 rounded-lg bg-primary px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-primary transition-all hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] disabled:opacity-50"
        >
          {loading ? "…" : "Send"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
          {errorCode === "NO_STEAM" ? (
            <p className="mt-2 text-xs text-on-surface-variant">
              <Link href="/dashboard/profile#steam" className="font-semibold text-primary underline-offset-2 hover:underline">
                Open Profile → Steam
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {data && display ? (
        <div className="obsidian-glass mt-6 overflow-hidden rounded-2xl border border-outline-variant/25">
          {data.flags?.recency_prompt ? (
            <div className="border-b border-outline-variant/20 bg-primary/10 px-4 py-2.5 text-xs leading-relaxed text-on-surface-variant">
              {typeof data.flags.recency_months_used === "number" ? (
                <>
                  Showing games with a RAWG release date in roughly the last{" "}
                  <span className="font-semibold text-on-surface">{data.flags.recency_months_used}</span>{" "}
                  months (plus your taste filter). Text must match these dates—no fake &quot;just
                  released&quot; claims.
                </>
              ) : data.flags.recency_relaxed_newest_dated ? (
                <>
                  Tight &quot;recent&quot; windows had few matches; using the{" "}
                  <span className="font-semibold text-on-surface">newest-dated</span> games in your
                  taste pool.
                </>
              ) : data.flags.recency_relaxed_full_pool ? (
                <>
                  Many candidates lack release dates in RAWG; picks may include older titles—check the
                  release line below.
                </>
              ) : (
                <>Your prompt asked for a newer release; candidate ordering favors recent launches.</>
              )}
            </div>
          ) : null}
          <div className="flex flex-col gap-0 md:flex-row">
            <div className="relative aspect-[16/10] w-full md:aspect-auto md:h-auto md:w-[min(340px,42%)] md:min-h-[200px]">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={display.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 340px"
                />
              ) : (
                <div className="flex h-full min-h-[160px] w-full items-center justify-center bg-surface-container-highest text-sm text-on-surface-variant md:min-h-[200px]">
                  No artwork
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent md:bg-gradient-to-r" />
            </div>

            <div className="flex flex-1 flex-col justify-center gap-3 p-5 md:p-6">
              <div>
                <p className="font-label text-xs uppercase tracking-widest text-primary">Pick for you</p>
                <h4 className="mt-1 text-2xl font-black tracking-tight text-on-surface">{display.name}</h4>
                {display.released_display ? (
                  <p className="mt-1 text-xs font-medium text-outline">
                    Released{" "}
                    <time dateTime={display.released ?? undefined}>{display.released_display}</time>
                  </p>
                ) : null}
                {display.genres.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {display.genres.slice(0, 5).map((g) => (
                      <span
                        key={g}
                        className="rounded-full bg-surface-container-high/90 px-2.5 py-0.5 text-xs font-medium text-on-surface-variant"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <p className="text-sm leading-relaxed text-on-surface-variant">{display.brief_detail}</p>

              {data.insight ? (
                <p className="text-xs leading-relaxed text-on-surface-variant/85">
                  <span className="font-semibold text-secondary-fixed-dim">Library signal: </span>
                  {data.insight}
                </p>
              ) : null}

              <p className="text-xs leading-relaxed text-on-surface-variant/85">
                <span className="font-semibold text-secondary-fixed-dim">Why it fits now: </span>
                {data.answer}
                {data.game?.reason ? (
                  <>
                    {" "}
                    {data.game.reason}
                  </>
                ) : null}
              </p>

              <p className="text-xs text-outline">
                <span className="font-semibold text-on-surface-variant">Algorithm match: </span>
                {display.algorithm_reason}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={`/dashboard/games/${display.slug}`}
                  className="inline-flex rounded-lg bg-primary px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-on-primary transition hover:opacity-90"
                >
                  Game details
                </Link>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void runRequest("regenerate")}
                  className="inline-flex rounded-lg bg-surface-container-high px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-on-surface ring-1 ring-outline-variant/25 transition hover:bg-surface-container-highest disabled:opacity-50"
                >
                  Regenerate pick
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
