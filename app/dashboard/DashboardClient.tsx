"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BlacklistManager } from "@/components/BlacklistManager";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { SteamConnectForm } from "@/components/SteamConnectForm";
import { SteamConnectedCard } from "@/components/SteamConnectedCard";
import { GamePromptBox } from "@/components/GamePromptBox";

type BlacklistItem = { id: number; game_name: string };
type SteamTrajectoryPoint = { label: string; corePct: number; recentPct: number };
type SteamSession = {
  appid: number;
  name: string;
  recentHours: number;
  totalHours: number;
  lastPlayedAt: number | null;
  imageUrl: string;
};
type SteamStats = {
  totalGames: number;
  totalHours: number;
  recentHours: number;
  coreDnaMatch: number;
  driftVelocity: number;
  trajectory: SteamTrajectoryPoint[];
  sessions: SteamSession[];
};

function formatRelativeTime(unixTs: number | null): string {
  if (!unixTs) return "Recently";
  const now = Date.now();
  const diffMs = now - unixTs * 1000;
  if (diffMs <= 0) return "Today";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function DashboardClient({
  userEmail,
  steamConnected,
  blacklist
}: {
  userEmail?: string;
  steamConnected: boolean;
  blacklist: BlacklistItem[];
}) {
  const [isSteamConnected, setIsSteamConnected] = useState(steamConnected);
  const [recommendationsRefreshKey, setRecommendationsRefreshKey] = useState(0);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [stats, setStats] = useState<SteamStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  function refreshRecommendations() {
    setRecommendationsRefreshKey((v) => v + 1);
  }

  function refreshStats() {
    setStatsRefreshKey((v) => v + 1);
  }

  useEffect(() => {
    async function loadStats() {
      if (!isSteamConnected) {
        setStats(null);
        setStatsError(null);
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      setStatsError(null);
      try {
        const response = await fetch("/api/steam/stats");
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Could not load Steam stats.");
        setStats(payload);
      } catch (err) {
        setStatsError(err instanceof Error ? err.message : "Could not load Steam stats.");
      } finally {
        setStatsLoading(false);
      }
    }

    loadStats();
  }, [isSteamConnected, statsRefreshKey]);

  return (
    <main className="mx-auto max-w-[1440px] px-8 py-12">
      <section className="mb-20">
        <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div className="max-w-2xl">
            <p className="font-label mb-4 text-sm uppercase tracking-[0.2em] text-tertiary">
              AI Analysis Engine
            </p>
            <h1 className="mb-6 text-5xl font-extrabold leading-none tracking-tighter">
              Discovery Radar
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant">
              Steam gameplay metrics below are generated from your live owned-games profile and recent
              playtime activity.
            </p>
            {userEmail ? (
              <p className="mt-3 text-sm text-on-surface-variant/80">{userEmail}</p>
            ) : null}
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end rounded-lg bg-surface-container-low p-4">
              <span className="font-label text-xs uppercase text-secondary-fixed-dim">
                Core DNA Match
              </span>
              <span className="text-3xl font-black tracking-tighter text-primary">
                {statsLoading ? "--" : `${stats?.coreDnaMatch ?? 0}%`}
              </span>
            </div>
            <div className="flex flex-col items-end rounded-lg bg-surface-container-low p-4">
              <span className="font-label text-xs uppercase text-secondary-fixed-dim">
                Drift Velocity
              </span>
              <span className="text-3xl font-black tracking-tighter text-tertiary">
                {statsLoading ? "--" : `+${stats?.driftVelocity ?? 0}%`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="relative overflow-hidden rounded-xl bg-surface-container p-8 md:col-span-8">
            <div className="pointer-events-none absolute inset-0 drift-gradient opacity-20" />
            <div className="relative z-10">
              <div className="mb-12 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-xl font-bold">Playstyle Trajectory</h3>
                  <p className="text-sm text-on-surface-variant">Last 90 days vs All-time baseline</p>
                </div>
                <div className="flex gap-2">
                  <span className="font-label flex items-center gap-2 text-xs text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary" /> CORE
                  </span>
                  <span className="font-label flex items-center gap-2 text-xs text-tertiary">
                    <span className="h-2 w-2 rounded-full bg-tertiary" /> RECENT
                  </span>
                </div>
              </div>
              <div className="flex h-64 items-end justify-between gap-4">
                {(stats?.trajectory ?? []).map((point) => (
                  <div key={point.label} className="group/bar relative h-full w-full rounded-t-lg bg-surface-container-highest">
                    <div
                      className="absolute bottom-0 left-0 w-full rounded-t-lg bg-primary/40 transition-all duration-500 group-hover/bar:opacity-90"
                      style={{ height: `${point.corePct}%` }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-full rounded-t-lg bg-tertiary/40 transition-all duration-500 group-hover/bar:opacity-90"
                      style={{ height: `${point.recentPct}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="font-label mt-4 flex justify-between gap-2 text-[10px] uppercase tracking-widest text-outline">
                {(stats?.trajectory ?? []).map((point) => (
                  <span key={`${point.label}-label`} className="line-clamp-1 max-w-20 text-center">
                    {point.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:col-span-4">
            <div className="rounded-xl border-l-4 border-primary bg-surface-container-high p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed-dim">psychology</span>
                <h4 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
                  AI Prediction
                </h4>
              </div>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {statsLoading
                  ? "Analyzing Steam profile..."
                  : `Loaded ${stats?.totalGames ?? 0} games with ${stats?.totalHours ?? 0}h lifetime playtime and ${stats?.recentHours ?? 0}h in the last 2 weeks.`}
              </p>
            </div>
            <div
              id="steam-connect"
              className="flex flex-grow flex-col justify-center rounded-xl bg-surface-container p-6 text-center"
            >
              {!isSteamConnected ? (
                <SteamConnectForm
                  embedded
                  onConnected={() => {
                    setIsSteamConnected(true);
                    refreshRecommendations();
                    refreshStats();
                  }}
                />
              ) : (
                <div className="w-full text-left">
                  <SteamConnectedCard
                    onDisconnected={() => {
                      setIsSteamConnected(false);
                      refreshRecommendations();
                      refreshStats();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mb-20">
        <GamePromptBox blacklist={blacklist} />
      </div>

      <section className="mb-20">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-3xl font-bold tracking-tight">Recent Sessions</h3>
          <button
            type="button"
            className="font-label flex items-center gap-1 text-sm text-primary-fixed-dim transition-colors hover:text-primary"
          >
            VIEW HISTORY <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        {statsError ? <p className="text-sm text-error">{statsError}</p> : null}
        <div className="space-y-4">
          {(stats?.sessions ?? []).map((session) => (
            <div
              key={session.appid}
              className="group flex items-center justify-between rounded-lg bg-surface-container-low p-4 transition-all duration-300 hover:bg-surface-container-highest"
            >
              <div className="flex items-center gap-6">
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-surface-container-highest">
                  <Image
                    alt={session.name}
                    className="object-cover grayscale transition-all group-hover:grayscale-0"
                    fill
                    src={session.imageUrl}
                    sizes="112px"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold">{session.name}</h4>
                  <div className="mt-1 flex gap-4">
                    <span className="font-label text-xs uppercase tracking-wider text-outline">
                      {formatRelativeTime(session.lastPlayedAt)}
                    </span>
                    <span className="font-label text-xs uppercase tracking-wider text-primary-fixed-dim">
                      {session.recentHours} Hours (2w)
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden items-center gap-8 pr-8 md:flex">
                <div className="text-right">
                  <div className="font-label text-[10px] uppercase text-outline">Lifetime</div>
                  <div className="font-bold text-on-surface">{session.totalHours} Hours</div>
                </div>
              </div>
            </div>
          ))}
          {!statsLoading && (stats?.sessions?.length ?? 0) === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No recent Steam sessions available yet. Launch a game and refresh.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mb-20">
        <div className="mb-8">
          <h3 className="text-3xl font-bold tracking-tight">Rift Suggestions</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Cross-analyzed with your behavioral drift trends. Search, filter, and sort below.
          </p>
        </div>
        <RecommendationsPanel refreshKey={recommendationsRefreshKey} />
      </section>

      <section>
        <BlacklistManager initialItems={blacklist} onChanged={refreshRecommendations} />
      </section>
    </main>
  );
}
