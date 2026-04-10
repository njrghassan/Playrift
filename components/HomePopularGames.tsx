import Image from "next/image";
import Link from "next/link";
import type { RawgGameSummary } from "@/services/rawgService";

function IconOpenGame({ className }: { className?: string }) {
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
        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

export function HomePopularGames({ games }: { games: RawgGameSummary[] }) {
  if (games.length === 0) {
    return (
      <p className="rounded-xl bg-surface-container-high/50 py-12 text-center text-sm text-on-surface-variant">
        Trending games will load here when the catalog is available. You can still{" "}
        <a
          href="https://rawg.io/discover"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          browse RAWG Discover
        </a>{" "}
        in the meantime.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {games.map((game) => {
        const ratings =
          game.ratings_count != null && game.ratings_count > 0
            ? `${game.ratings_count.toLocaleString()} ratings`
            : "RAWG";

        return (
          <Link
            key={game.id}
            href={`/dashboard/games/${game.slug}`}
            className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-highest transition-all duration-500 hover:-translate-y-2"
          >
            {game.background_image ? (
              <Image
                src={game.background_image}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 bg-surface-container-high" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-0 left-0 w-full p-6">
              <div className="font-label mb-2 text-[10px] uppercase text-primary">Popular now</div>
              <h4 className="line-clamp-2 text-xl font-bold text-white">{game.name}</h4>
              <div className="mt-3 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-sm font-medium text-tertiary">{ratings}</span>
                <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  <IconOpenGame className="size-4" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
