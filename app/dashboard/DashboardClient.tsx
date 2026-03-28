"use client";

import { useState } from "react";
import { BlacklistManager } from "@/components/BlacklistManager";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { SteamConnectForm } from "@/components/SteamConnectForm";
import { GamePromptBox } from "@/components/GamePromptBox";

type BlacklistItem = { id: number; game_name: string };

export default function DashboardClient({
  steamConnected,
  blacklist
}: {
  steamConnected: boolean;
  blacklist: BlacklistItem[];
}) {
  const [isSteamConnected, setIsSteamConnected] = useState(steamConnected);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-10 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {!isSteamConnected ? (
          <SteamConnectForm
            onConnected={() => {
              setIsSteamConnected(true);
              refresh();
            }}
          />
        ) : null}
        <GamePromptBox blacklist={blacklist} />
        <RecommendationsPanel refreshKey={refreshKey} />
      </div>
      <div>
        <BlacklistManager initialItems={blacklist} onChanged={refresh} />
      </div>
    </div>
  );
}
