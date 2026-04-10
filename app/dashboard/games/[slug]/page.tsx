import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RawgReviewBlock } from "@/components/RawgReviewBlock";
import { getCachedGameDetailsBySlug } from "@/lib/cachedGameDetails";

function plainDescription(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildCriticLinks(gameName: string, metacriticUrl: string | null) {
  const q = gameName.trim();
  const google = (site: string) =>
    `https://www.google.com/search?q=${encodeURIComponent(`site:${site} ${q} review`)}`;
  return [
    {
      name: "Metacritic",
      href: metacriticUrl ?? google("metacritic.com"),
      note: "Critic aggregate + outlet reviews",
      icon: "M",
      iconClass: "bg-[#66cc33] text-black"
    },
    {
      name: "OpenCritic",
      href: google("opencritic.com"),
      note: "Curated critic reviews and averages",
      icon: "OC",
      iconClass: "bg-[#f37021] text-white"
    },
    {
      name: "IGN Reviews",
      href: google("ign.com"),
      note: "Editorial review coverage",
      icon: "IGN",
      iconClass: "bg-[#e60012] text-white"
    },
    {
      name: "PC Gamer Reviews",
      href: google("pcgamer.com"),
      note: "PC-focused review writeups",
      icon: "PC",
      iconClass: "bg-[#ff4d4d] text-white"
    }
  ];
}

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getCachedGameDetailsBySlug(slug);
  if (!game) notFound();

  const about = plainDescription(game.description_raw).slice(0, 4000);
  const criticLinks = buildCriticLinks(game.name, game.metacritic_url);

  return (
    <main className="mx-auto max-w-[1100px] px-8 py-10">
        <Link
          href="/dashboard"
          className="inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          ← Back to dashboard
        </Link>

        <div className="relative mt-8 aspect-[16/7] w-full overflow-hidden rounded-2xl bg-surface-container-highest">
          {game.background_image ? (
            <Image
              src={game.background_image}
              alt={game.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1100px) 100vw, 1100px"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-4xl font-black tracking-tight text-on-surface">{game.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-on-surface-variant">
              {game.released ? <span>Released {game.released}</span> : null}
              {game.genres.map((g) => (
                <span key={g.id} className="rounded-full bg-surface-container-high/90 px-2 py-0.5">
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {game.metacritic != null ? (
            <div className="rounded-xl bg-surface-container-low p-5">
              <div className="font-label text-xs uppercase tracking-wider text-secondary-fixed-dim">
                Metacritic
              </div>
              <div className="mt-1 text-3xl font-black text-on-surface">{game.metacritic}</div>
            </div>
          ) : null}
          {game.playtime != null ? (
            <div className="rounded-xl bg-surface-container-low p-5">
              <div className="font-label text-xs uppercase tracking-wider text-secondary-fixed-dim">
                Avg. playtime (RAWG)
              </div>
              <div className="mt-1 text-3xl font-black text-on-surface">{game.playtime}h</div>
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          <RawgReviewBlock
            variant="full"
            ratings={game.ratings}
            rating={game.rating}
            rating_top={game.rating_top}
            ratings_count={game.ratings_count}
            positiveOverride={game.positive_review_percent}
          />
        </div>

        <section className="mt-8 rounded-xl bg-surface-container-low p-6">
          <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
            Critic reviews
          </h2>
          <p className="mt-2 text-xs text-on-surface-variant">
            External editorial sources for in-depth reviews.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {criticLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-surface-container px-4 py-3 ring-1 ring-outline-variant/20 transition hover:ring-primary/40"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wide ${link.iconClass}`}
                    aria-hidden
                  >
                    {link.icon}
                  </span>
                  <div className="text-sm font-semibold text-on-surface">{link.name}</div>
                </div>
                <div className="mt-1 text-xs text-on-surface-variant">{link.note}</div>
              </a>
            ))}
          </div>
        </section>

        {(game.pc_requirements_minimum || game.pc_requirements_recommended) && (
          <section className="mt-8 rounded-xl bg-surface-container-low p-6">
            <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
              PC requirements
            </h2>
            <p className="mt-2 text-xs text-on-surface-variant">
              Sourced from RAWG (often matches storefront listings).
            </p>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {game.pc_requirements_minimum ? (
                <div>
                  <h3 className="font-bold text-on-surface">Minimum</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
                    {game.pc_requirements_minimum}
                  </p>
                </div>
              ) : null}
              {game.pc_requirements_recommended ? (
                <div>
                  <h3 className="font-bold text-on-surface">Recommended</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
                    {game.pc_requirements_recommended}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        )}

        {about ? (
          <section className="mt-8">
            <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">About</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
              {about}
            </p>
          </section>
        ) : null}

        {game.platforms.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
              Platforms
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {game.platforms.map((p) => (
                <li
                  key={`${p.id}-${p.name}`}
                  className="rounded-lg bg-surface-container-low px-3 py-1 text-sm text-on-surface"
                >
                  {p.name}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {(game.developers.length > 0 || game.publishers.length > 0) && (
          <section className="mt-8 grid gap-6 md:grid-cols-2">
            {game.developers.length > 0 ? (
              <div>
                <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
                  Developers
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {game.developers.map((d) => d.name).join(", ")}
                </p>
              </div>
            ) : null}
            {game.publishers.length > 0 ? (
              <div>
                <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
                  Publishers
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {game.publishers.map((d) => d.name).join(", ")}
                </p>
              </div>
            ) : null}
          </section>
        )}

        {game.stores.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">Stores</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {game.stores.map((s, i) => (
                <li key={`${s.name}-${i}`}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:opacity-90"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {(game.website || game.reddit_url) && (
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            {game.website ? (
              <a
                href={game.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:underline"
              >
                Official site
              </a>
            ) : null}
            {game.reddit_url ? (
              <a
                href={game.reddit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:underline"
              >
                Reddit
              </a>
            ) : null}
            <a
              href={`https://rawg.io/games/${game.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant underline-offset-2 hover:underline"
            >
              View on RAWG
            </a>
          </div>
        )}

        {game.screenshots.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
              Screenshots
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {game.screenshots.slice(0, 9).map((sh) => (
                <div key={sh.id} className="relative aspect-video overflow-hidden rounded-lg bg-surface-container-highest">
                  <Image src={sh.image} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                </div>
              ))}
            </div>
          </section>
        ) : null}
    </main>
  );
}
