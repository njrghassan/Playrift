"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { DISPLAY_CURRENCIES, isSupportedCurrency } from "@/lib/currency";
import { RecommendedGame } from "@/lib/types";

const CURRENCY_PREF_KEY = "playrift_currency_pref";

function readStoredCurrencyPref(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CURRENCY_PREF_KEY);
  if (!raw || raw === "auto") return null;
  return isSupportedCurrency(raw) ? raw.toUpperCase() : null;
}

type ApiData = {
  recommendations: RecommendedGame[];
  insight: string;
  currency: string;
};

type SortOption = "match-desc" | "match-asc" | "popularity-desc" | "popularity-asc" | "name-asc" | "name-desc";

const INITIAL_VISIBLE_COUNT = 3;

function popularityValue(g: RecommendedGame): number {
  return g.added ?? g.ratings_count ?? 0;
}

function formatMoney(value: number | null | undefined, currency: string): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value <= 0) return "Free";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

export function RecommendationsPanel({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [genreSlug, setGenreSlug] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("match-desc");
  const [showAllGames, setShowAllGames] = useState(false);
  const [currencyPref, setCurrencyPref] = useState<string | null>(null);
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    setShowAllGames(false);
  }, [refreshKey]);

  useEffect(() => {
    setCurrencyPref(readStoredCurrencyPref());
    setPrefsReady(true);
  }, []);

  useEffect(() => {
    if (!prefsReady) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const qs =
        currencyPref != null ? `?currency=${encodeURIComponent(currencyPref)}` : "";
      const response = await fetch(`/api/recommendations${qs}`);
      const payload = await response.json();
      if (!response.ok) {
        if (!cancelled) {
          setError(payload.error ?? "Could not load recommendations.");
          setLoading(false);
        }
        return;
      }
      if (!cancelled) {
        setData(payload);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [prefsReady, refreshKey, currencyPref]);

  const genreOptions = useMemo(() => {
    const recs = data?.recommendations ?? [];
    const map = new Map<string, string>();
    for (const g of recs) {
      for (const genre of g.genres) {
        if (!map.has(genre.slug)) map.set(genre.slug, genre.name);
      }
    }
    return [...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([slug, name]) => ({ slug, name }));
  }, [data?.recommendations]);

  const filteredSorted = useMemo(() => {
    const recs = data?.recommendations ?? [];
    const q = query.trim().toLowerCase();

    let list = recs.filter((game) => {
      if (genreSlug && !game.genres.some((g) => g.slug === genreSlug)) return false;
      if (!q) return true;
      if (game.name.toLowerCase().includes(q)) return true;
      if (game.reason.toLowerCase().includes(q)) return true;
      if (game.genres.some((g) => g.name.toLowerCase().includes(q))) return true;
      return false;
    });

    const maxScore = Math.max(1, ...list.map((g) => g.score));

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "match-desc":
          return b.score - a.score;
        case "match-asc":
          return a.score - b.score;
        case "popularity-desc":
          return popularityValue(b) - popularityValue(a);
        case "popularity-asc":
          return popularityValue(a) - popularityValue(b);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return { list, maxScore };
  }, [data?.recommendations, query, genreSlug, sort]);

  const visibleGames = showAllGames
    ? filteredSorted.list
    : filteredSorted.list.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = Math.max(0, filteredSorted.list.length - INITIAL_VISIBLE_COUNT);
  const showLoading = !prefsReady || loading;

  return (
    <div>
      <div className="mb-10 rounded-xl bg-surface-container-low p-6">
        <h3 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
          Behavioral Insight
        </h3>
        <p className="mt-2 text-on-surface-variant">
          {data?.insight ?? "Connect Steam to generate your behavioral insight."}
        </p>
      </div>

      {showLoading && (
        <p className="text-center text-on-surface-variant">Loading recommendations...</p>
      )}
      {error && <p className="text-center text-error">{error}</p>}

      {!showLoading && !error && data && (
        <>
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center text-on-surface-variant">
                <SearchIcon className="size-5 shrink-0" />
              </span>
              <input
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, genre, or reason..."
                className="w-full rounded-lg border-none bg-surface-container-low py-3 pl-12 pr-4 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 transition focus:ring-2 focus:ring-primary"
                aria-label="Search recommendations"
                role="searchbox"
              />
            </div>
            <div className="flex w-full flex-col flex-wrap gap-3 sm:flex-row sm:items-end sm:justify-end">
              <label className="flex min-w-[10rem] flex-1 flex-col gap-1 sm:max-w-[12rem]">
                <span className="font-label text-[10px] uppercase tracking-wider text-secondary-fixed-dim">
                  Genre
                </span>
                <select
                  value={genreSlug}
                  onChange={(e) => setGenreSlug(e.target.value)}
                  className="rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
                >
                  <option value="">All genres</option>
                  {genreOptions.map(({ slug, name }) => (
                    <option key={slug} value={slug}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-[10rem] flex-1 flex-col gap-1 sm:max-w-[14rem]">
                <span className="font-label text-[10px] uppercase tracking-wider text-secondary-fixed-dim">
                  Sort by
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
                >
                  <option value="match-desc">Match (high → low)</option>
                  <option value="match-asc">Match (low → high)</option>
                  <option value="popularity-desc">Popularity (high → low)</option>
                  <option value="popularity-asc">Popularity (low → high)</option>
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                </select>
              </label>
              <label className="flex min-w-[10rem] flex-1 flex-col gap-1 sm:min-w-[14rem] sm:max-w-[18rem]">
                <span className="font-label text-[10px] uppercase tracking-wider text-secondary-fixed-dim">
                  Currency
                </span>
                <select
                  value={currencyPref ?? "auto"}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "auto") {
                      setCurrencyPref(null);
                      localStorage.removeItem(CURRENCY_PREF_KEY);
                    } else {
                      setCurrencyPref(v);
                      localStorage.setItem(CURRENCY_PREF_KEY, v);
                    }
                  }}
                  className="rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
                >
                  <option value="auto">Auto (by region)</option>
                  {DISPLAY_CURRENCIES.map(({ code, label }) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filteredSorted.list.length === 0 ? (
            <p className="rounded-xl bg-surface-container-low py-12 text-center text-on-surface-variant">
              No games match your search or filters. Try adjusting them.
            </p>
          ) : (
            <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {visibleGames.map((game) => {
                const pct = Math.round((game.score / filteredSorted.maxScore) * 100);
                const matchLabel = `${pct}% Match`;
                const tag = game.genres[0]?.name ?? "Match";

                return (
                  <article
                    key={game.id}
                    className="group flex flex-col overflow-hidden rounded-xl bg-surface-container shadow-2xl transition-shadow duration-300 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)]"
                  >
                    <div className="relative h-48 shrink-0 overflow-hidden rounded-t-xl">
                      <div className="absolute inset-0 bg-surface-container-highest">
                        {game.background_image ? (
                          <Image
                            src={game.background_image}
                            alt={game.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : null}
                      </div>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container to-transparent" />
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                        <span className="font-label rounded-full bg-primary-container/80 px-3 py-1 text-[10px] font-bold uppercase text-on-primary-container backdrop-blur-md">
                          {matchLabel}
                        </span>
                        <span className="font-label rounded-full bg-surface-container-highest/80 px-3 py-1 text-[10px] uppercase text-on-surface backdrop-blur-md">
                          {tag}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-grow flex-col p-6">
                      <h4 className="mb-2 text-xl font-bold">{game.name}</h4>
                      <p className="mb-6 flex-grow text-sm leading-relaxed text-on-surface-variant">
                        {game.reason}
                      </p>
                      <div className="mt-auto space-y-3 border-t border-outline-variant/10 pt-6">
                        <div className="flex items-baseline justify-between gap-3">
                          <div>
                            <div className="font-label text-[10px] uppercase tracking-wider text-outline">
                              From (deals) · {data.currency}
                            </div>
                            <div className="text-xl font-black tabular-nums text-tertiary">
                              {formatMoney(game.price, data.currency)}
                            </div>
                          </div>
                          <a
                            href={`https://www.cheapshark.com/search?storeID=1&pageSize=5&searchTitle=${encodeURIComponent(game.name)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-label shrink-0 text-xs font-semibold text-primary underline-offset-2 hover:underline"
                          >
                            Deals
                          </a>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-lg font-black text-on-surface">Explore</span>
                          <a
                            href={`https://rawg.io/games/${game.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded bg-primary px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-on-primary transition-all hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] active:scale-95"
                          >
                            Explore Rift
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {hiddenCount > 0 ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllGames((v) => !v)}
                  className="rounded-lg bg-surface-container-low px-6 py-3 font-label text-sm font-bold uppercase tracking-widest text-primary ring-1 ring-outline-variant/30 transition hover:bg-surface-container-high hover:ring-primary/40"
                >
                  {showAllGames ? "Show less" : `Show more (${hiddenCount} more)`}
                </button>
              </div>
            ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
