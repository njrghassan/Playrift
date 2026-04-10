"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BlacklistManager } from "@/components/BlacklistManager";
import { SteamSessionImage } from "@/components/SteamSessionImage";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { GamePromptBox } from "@/components/GamePromptBox";

type BlacklistItem = { id: number; game_name: string };
type SteamTrajectoryPoint = { label: string; corePct: number; recentPct: number };
type SteamSession = {
  appid: number;
  name: string;
  recentHours: number;
  totalHours: number;
  lastPlayedAt: number | null;
  img_logo_url?: string;
  img_icon_url?: string;
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
  userDisplayName,
  userAvatarUrl,
  steamConnected,
  blacklist
}: {
  userEmail?: string;
  userDisplayName?: string;
  userAvatarUrl?: string;
  steamConnected: boolean;
  blacklist: BlacklistItem[];
}) {
  const [isSteamConnected, setIsSteamConnected] = useState(steamConnected);
  const [recommendationsRefreshKey, setRecommendationsRefreshKey] = useState(0);
  const [stats, setStats] = useState<SteamStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    setIsSteamConnected(steamConnected);
  }, [steamConnected]);

  function refreshRecommendations() {
    setRecommendationsRefreshKey((v) => v + 1);
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
  }, [isSteamConnected]);

  const trajectoryLine = !isSteamConnected
    ? "Connect Steam in Profile to load playtime and this chart."
    : statsLoading
      ? "Analyzing Steam profile…"
      : `${stats?.totalGames ?? 0} games · ${stats?.totalHours ?? 0}h lifetime · ${stats?.recentHours ?? 0}h in the last 2 weeks.`;

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
            <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant/80">
              {userAvatarUrl ? (
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-outline-variant/30">
                  <Image
                    src={userAvatarUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized
                  />
                </span>
              ) : null}
              <span>
              {userDisplayName ? <span className="font-semibold text-on-surface">{userDisplayName}</span> : null} 
              {(userDisplayName || userEmail) && (
                <>
                  {" "}
                  ·{" "}
                  <Link href="/dashboard/profile" className="text-primary underline-offset-2 hover:underline">
                    Profile
                  </Link>
                </>
              )}
              </span>
            </p>
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

        <div className="relative overflow-hidden rounded-xl bg-surface-container p-8">
          <div className="pointer-events-none absolute inset-0 drift-gradient opacity-20" />
          <div className="relative z-10">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="mb-1 text-xl font-bold">Playstyle Trajectory</h3>
                <p className="text-sm text-on-surface-variant">Last 90 days vs All-time baseline</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="font-label flex items-center gap-2 text-xs text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" /> CORE
                </span>
                <span className="font-label flex items-center gap-2 text-xs text-tertiary">
                  <span className="h-2 w-2 rounded-full bg-tertiary" /> RECENT
                </span>
              </div>
            </div>
            <p className="mb-6 text-xs text-on-surface-variant sm:text-sm">{trajectoryLine}</p>
            <div className="flex h-64 items-end justify-between gap-4">
              {(stats?.trajectory ?? []).map((point) => (
                <div
                  key={point.label}
                  className="group/bar relative h-full w-full rounded-t-lg bg-surface-container-highest"
                >
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
      </section>

      <section className="mb-12 rounded-xl bg-surface-container-low p-8">
        <h3 className="text-2xl font-bold">Play together</h3>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          Compare your library with a friend side by side, see overlapping recommendations, and browse co-op ideas.
        </p>
        {isSteamConnected ? (
          <Link
            href="/dashboard/play-together"
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-label text-xs font-bold uppercase tracking-widest text-on-primary"
          >
            Open comparison
          </Link>
        ) : (
          <p className="mt-4 text-sm text-on-surface-variant">
            <Link href="/dashboard/profile#steam" className="text-primary underline-offset-2 hover:underline">
              Connect Steam in Profile
            </Link>{" "}
            first.
          </p>
        )}
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
                  <SteamSessionImage
                    className="object-cover grayscale transition-all group-hover:grayscale-0"
                    game={session}
                    name={session.name}
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
            Cross-analyzed with your behavioral drift trends across a multi-platform catalog. Search, filter,
            and sort below.
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
