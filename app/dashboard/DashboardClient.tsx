"use client";

import { useState } from "react";
import { BlacklistManager } from "@/components/BlacklistManager";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { SteamConnectForm } from "@/components/SteamConnectForm";
import { GamePromptBox } from "@/components/GamePromptBox";

const SESSION_IMG_1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCbmMrCtkDrlgnEkKnlklmg8ShcXXJGdGkfucwutHQhjCPl6afI6Q-hN8gs2F6gCeNdNky8zJ7Y2yNORqWo1MSU1gPn7z871-lVdxc6wwM89tVKeofSOAEqlYcMXJDerAyRAhpbnWQ04vdzEyy3rn7ny8kYOnN0Gchgfzhp7WJzQopeJwt8l_VSU9oxkCRxljc5xnHNBC_KstXS4-LNJ8L0gULUBv3Qym1ofldM71sK08H7HGFEuxRU5xZdvvR4qwBd0YxJQADMFTFf";

const SESSION_IMG_2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCX2SBM5eeiDgZC5P5OVltss8ygjUQpsP7NEFr_IqLBwZ_Zz6HY-3AlO1y1SnjTFPrRDSFhJ9yrq089CiC4ZuHYqq-SwrGnZYZHgOy2vN1X9NpPWaBejVg18IEY0kB5lfDdYOngW5DL1S0of3nNWX6Rbpo9ZIx3v1uYVUNO5kDLE-az7XlA3hUDN3uX8Ijt2Vx5etSFL6QAdCSPHtYs7QLttxu4Z1Qt-LqMDvSTLfKyUoR9rEp5fJBQJWNkMKLfWdYjWlT91BVOgr2U";

type BlacklistItem = { id: number; game_name: string };

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
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

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
              Your behavioral drift indicates a shift from{" "}
              <span className="font-bold text-primary">Competitive FPS</span> towards{" "}
              <span className="font-bold text-tertiary">Atmospheric Roguelikes</span>.
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
              <span className="text-3xl font-black tracking-tighter text-primary">88.4%</span>
            </div>
            <div className="flex flex-col items-end rounded-lg bg-surface-container-low p-4">
              <span className="font-label text-xs uppercase text-secondary-fixed-dim">
                Drift Velocity
              </span>
              <span className="text-3xl font-black tracking-tighter text-tertiary">+12.5%</span>
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
                <div className="group/bar relative h-[40%] w-full rounded-t-lg bg-surface-container-highest">
                  <div className="absolute bottom-0 left-0 h-[70%] w-full rounded-t-lg bg-primary/40 transition-all duration-500 group-hover/bar:h-[85%]" />
                </div>
                <div className="group/bar relative h-[65%] w-full rounded-t-lg bg-surface-container-highest">
                  <div className="absolute bottom-0 left-0 h-[60%] w-full rounded-t-lg bg-primary/40 transition-all duration-500 group-hover/bar:h-[75%]" />
                </div>
                <div className="group/bar relative h-[80%] w-full rounded-t-lg bg-surface-container-highest">
                  <div className="absolute bottom-0 left-0 h-[90%] w-full rounded-t-lg bg-primary/40 transition-all duration-500 group-hover/bar:h-[95%]" />
                </div>
                <div className="group/bar relative h-[55%] w-full rounded-t-lg bg-surface-container-highest">
                  <div className="absolute bottom-0 left-0 h-[40%] w-full rounded-t-lg bg-tertiary/40 transition-all duration-500 group-hover/bar:h-[50%]" />
                </div>
                <div className="group/bar relative h-[45%] w-full rounded-t-lg bg-surface-container-highest">
                  <div className="absolute bottom-0 left-0 h-[80%] w-full rounded-t-lg bg-tertiary/40 transition-all duration-500 group-hover/bar:h-[90%]" />
                </div>
                <div className="group/bar relative h-[90%] w-full rounded-t-lg bg-surface-container-highest">
                  <div className="absolute bottom-0 left-0 h-[95%] w-full rounded-t-lg bg-tertiary/40 transition-all duration-500 group-hover/bar:h-[100%]" />
                </div>
              </div>
              <div className="font-label mt-4 flex justify-between text-[10px] uppercase tracking-widest text-outline">
                <span>Strategic</span>
                <span>Reflex</span>
                <span>Social</span>
                <span>Grind</span>
                <span>Immersion</span>
                <span>Creative</span>
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
                Detected rising preference for{" "}
                <span className="font-semibold text-on-surface">emergent narratives</span>. Your next rift
                suggestion focuses on unscripted consequences.
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
                    refresh();
                  }}
                />
              ) : (
                <>
                  <span className="material-symbols-outlined mb-2 text-4xl text-tertiary">
                    auto_awesome
                  </span>
                  <h4 className="text-2xl font-black text-on-surface">Rift Ready</h4>
                  <p className="font-label mt-2 text-xs uppercase text-outline">Steam linked</p>
                </>
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
        <div className="space-y-4">
          <div className="group flex items-center justify-between rounded-lg bg-surface-container-low p-4 transition-all duration-300 hover:bg-surface-container-highest">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-surface-container-highest">
                <img
                  alt=""
                  className="h-full w-full object-cover grayscale transition-all group-hover:grayscale-0"
                  src={SESSION_IMG_1}
                />
              </div>
              <div>
                <h4 className="text-lg font-bold">Neon Abyss: Infinite</h4>
                <div className="mt-1 flex gap-4">
                  <span className="font-label text-xs uppercase tracking-wider text-outline">
                    Yesterday
                  </span>
                  <span className="font-label text-xs uppercase tracking-wider text-primary-fixed-dim">
                    4.5 Hours
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden items-center gap-8 pr-8 md:flex">
              <div className="text-right">
                <div className="font-label text-[10px] uppercase text-outline">Achievements</div>
                <div className="font-bold text-on-surface">12 / 40</div>
              </div>
              <div className="text-right">
                <div className="font-label text-[10px] uppercase text-outline">AI Focus</div>
                <div className="font-bold text-tertiary">+12.4 Reflex</div>
              </div>
              <button
                type="button"
                className="rounded-full p-2 transition-colors hover:bg-surface-container-lowest"
                aria-label="More options"
              >
                <span className="material-symbols-outlined text-outline">more_vert</span>
              </button>
            </div>
          </div>
          <div className="group flex items-center justify-between rounded-lg bg-surface-container-low p-4 transition-all duration-300 hover:bg-surface-container-highest">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-surface-container-highest">
                <img
                  alt=""
                  className="h-full w-full object-cover grayscale transition-all group-hover:grayscale-0"
                  src={SESSION_IMG_2}
                />
              </div>
              <div>
                <h4 className="text-lg font-bold">Stellaris: Overlord</h4>
                <div className="mt-1 flex gap-4">
                  <span className="font-label text-xs uppercase tracking-wider text-outline">
                    3 Days Ago
                  </span>
                  <span className="font-label text-xs uppercase tracking-wider text-primary-fixed-dim">
                    12.2 Hours
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden items-center gap-8 pr-8 md:flex">
              <div className="text-right">
                <div className="font-label text-[10px] uppercase text-outline">Achievements</div>
                <div className="font-bold text-on-surface">88 / 120</div>
              </div>
              <div className="text-right">
                <div className="font-label text-[10px] uppercase text-outline">AI Focus</div>
                <div className="font-bold text-primary">+5.2 Strategy</div>
              </div>
              <button
                type="button"
                className="rounded-full p-2 transition-colors hover:bg-surface-container-lowest"
                aria-label="More options"
              >
                <span className="material-symbols-outlined text-outline">more_vert</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold tracking-tight">Rift Suggestions</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Cross-analyzed with your behavioral drift trends.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-outline-variant/20 bg-surface-container p-2 transition-colors hover:bg-surface-container-high"
              aria-label="Tune suggestions"
            >
              <span className="material-symbols-outlined">tune</span>
            </button>
          </div>
        </div>
        <RecommendationsPanel refreshKey={refreshKey} />
      </section>

      <section>
        <BlacklistManager initialItems={blacklist} onChanged={refresh} />
      </section>
    </main>
  );
}
