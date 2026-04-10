import Image from "next/image";
import Link from "next/link";
import { GamePlatformChips } from "@/components/GamePlatformChips";
import type { RecommendedGame } from "@/lib/types";

export function PlayTogetherGameRow({ game }: { game: RecommendedGame }) {
  return (
    <Link
      href={`/dashboard/games/${game.slug}`}
      className="group flex gap-4 overflow-hidden rounded-xl bg-surface-container-low p-3 ring-1 ring-outline-variant/15 transition hover:ring-primary/30"
    >
      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-surface-container-highest">
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt=""
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="128px"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 py-1">
        <h4 className="font-bold text-on-surface group-hover:text-primary">{game.name}</h4>
        <GamePlatformChips platforms={game.platforms} className="mt-1 flex flex-wrap gap-1" />
        <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{game.reason}</p>
      </div>
    </Link>
  );
}
