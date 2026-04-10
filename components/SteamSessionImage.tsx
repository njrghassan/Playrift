"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { steamSessionImageUrls } from "@/lib/steamAppImage";
import type { SteamOwnedGame } from "@/lib/types";

type Props = {
  name: string;
  game: Pick<SteamOwnedGame, "appid" | "img_logo_url" | "img_icon_url">;
  className?: string;
};

export function SteamSessionImage({ name, game, className }: Props) {
  const urls = useMemo(() => steamSessionImageUrls(game as SteamOwnedGame), [game]);
  const [index, setIndex] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  if (failedAll) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-container-highest px-1 text-center text-[10px] font-medium leading-tight text-on-surface-variant">
        {name}
      </div>
    );
  }

  const src = urls[Math.min(index, urls.length - 1)];

  return (
    <Image
      alt={name}
      className={className}
      fill
      quality={90}
      sizes="224px"
      src={src}
      onError={() => {
        if (index + 1 < urls.length) setIndex((i) => i + 1);
        else setFailedAll(true);
      }}
    />
  );
}
