import Link from "next/link";
import { HomePopularGames } from "@/components/HomePopularGames";
import { fetchPopularGamesRecent } from "@/services/rawgService";

const HERO_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAVR_4vXbXTld-u2QvoMfN5UBcvDBCehm5bBJpwZhurYpYjt7akxOJ-1W-jdnMIywiY5qfRmixm-8SpTcZTR3APPJvhOQNFHYE3y88JwYqm-smndfuzVid6Dwl8ak3Q5_vld16KX5OW2dfovZA2hL-12fDVjx0IBzZhwFA922IXL50X7A91z4zbH986bHPunMeOmpuE1n66Y0Hb615jJPCQwkEjH42OGbkkf3ZVIrzfHPOnkOk4trk3eo2ut7W5dDV8ZOPxQEyzkfy9";

const BENTO_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAsYA-e0MU-FUgwwXGKRFmIhtLRIUqKqPGtE3Jc6UmB2fC-xokrHocDSDn2HeGdbKFfwDR38xSaXSvzBUQXdjzL9mocRWiwfi5MBh4Ly4fx4DgX_re9YBpyYciTFlegeDYORHwbXau_uVGSrrWKB2mjKs4JTm3SRK0samdyw7y6WHaNJRp3HBMI7kblJJ-CEWPg0GKEcbC58Dn6ghfql8X_OI_dtfkc7E5SkpMcBGXNzUJgtPGsVXsz8s8PGsJ5242eerdukNDXjO-c";

const ASYMMETRIC_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA1pyYcl_jt-Syq0pU3rDgQJXtIFKOjktZ6Tcahwra6pYGE5eunvSSh233I68TykePWz5LE67fpwpRaR3xHRqQkHux4y0ialTLkpIveOG69NrtLgyisW-ZI2vsHPmdIAUlRNWgt14LTN7aKlz0kxBJzPh-BsCMUwXnI7whWXz1CRJE_CidYbFSrXgLzZ2Ey7rZfMVFX_ciSz8ygLip5ZxbiDGl2wGPd67XogdlOma2yFKbXw0vDT7AJAEe00wIaw1cM4bO2BONYlUQD";

function NavSearchIcon({ className }: { className?: string }) {
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

function IconQuickGamePick({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

function IconRiftSuggestions({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  );
}

function IconPlayTogether({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

function IconChartInsight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}

function IconArrowForward({ className }: { className?: string }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default async function HomePage() {
  const popularGames = await fetchPopularGamesRecent(8);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <nav className="sticky top-0 z-50 bg-[#161e2f] font-body shadow-[0_20px_40px_rgba(7,0,108,0.15)] antialiased">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-8">
          <div className="text-2xl font-black tracking-tighter text-[#c0c1ff]">Playrift</div>
          <div className="hidden items-center space-x-10 md:flex">
            <a
              className="font-medium text-slate-400 transition-colors hover:text-slate-100"
              href="#features"
            >
              Features
            </a>
            <a
              className="font-medium text-slate-400 transition-colors hover:text-slate-100"
              href="#how"
            >
              How it Works
            </a>
            <Link
              className="font-medium text-slate-400 transition-colors hover:text-slate-100"
              href="/dashboard"
            >
              Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <div className="group relative hidden lg:block">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-primary">
                <NavSearchIcon className="size-4 shrink-0" />
              </div>
              <input
                className="w-64 appearance-none rounded-lg border-none bg-surface-container-lowest py-2 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-primary [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                placeholder="Search games..."
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                aria-label="Search games"
              />
            </div>
            <Link
              href="/signup"
              className="transform rounded-lg bg-primary-container px-6 py-2.5 font-bold text-on-primary-container transition-all duration-300 hover:bg-[#8083ff]/90 hover:shadow-[0_0_15px_rgba(192,193,255,0.3)] active:scale-95"
            >
              Connect Steam
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative flex min-h-[921px] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt=""
            className="h-full w-full object-cover opacity-40 mix-blend-luminosity"
            src={HERO_BG}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-12 px-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-outline-variant/30 bg-surface-container-highest/60 px-3 py-1 backdrop-blur-md">
              <span className="font-label mr-2 text-xs uppercase tracking-widest text-tertiary">
                New Update
              </span>
              <span className="font-label text-xs uppercase tracking-widest text-primary">
                v2.4 AI Engine Live
              </span>
            </div>
            <h1 className="text-6xl font-black leading-[0.9] tracking-tighter text-on-surface md:text-8xl">
              YOUR STEAM <br /> <span className="italic text-primary">REMASTERED.</span>
            </h1>
            <p className="max-w-lg text-xl leading-relaxed text-on-surface-variant">
              Playrift analyzes your library, playstyle, and achievements to synthesize the perfect gaming
              trajectory. No more scrolling, just playing.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/dashboard"
                className="rounded bg-primary px-8 py-4 text-lg font-bold text-on-primary transition-all hover:shadow-[0_0_30px_rgba(192,193,255,0.4)] active:scale-95"
              >
                Launch Dashboard
              </Link>
              <button
                type="button"
                className="glass-card rounded border border-outline-variant/30 px-8 py-4 text-lg font-bold text-on-surface transition-all hover:bg-surface-container-high"
              >
                View Discovery Queue
              </button>
            </div>
          </div>
          <div className="hidden grid-cols-2 gap-4 lg:grid">
            <div className="glass-card glow-border-primary col-span-2 rounded-xl border border-primary/20 p-6">
              <div className="mb-4 flex items-start justify-between">
                <span className="font-label text-xs uppercase tracking-tighter text-secondary-fixed-dim">
                  AI Prediction
                </span>
                <IconChartInsight className="size-6 shrink-0 text-primary" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-28 w-20 overflow-hidden rounded-md bg-surface-container-highest">
                  <img alt="" className="h-full w-full object-cover" src={BENTO_COVER} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Neon Protocol</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    98% Compatibility based on your recent RPG sessions.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="font-label rounded-full border border-primary/20 bg-surface-container-lowest px-2 py-1 text-[10px] uppercase text-primary">
                      Cyberpunk
                    </span>
                    <span className="font-label rounded-full border border-primary/20 bg-surface-container-lowest px-2 py-1 text-[10px] uppercase text-primary">
                      Tactical
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl border border-outline-variant/20 p-6">
              <span className="font-label mb-2 block text-[10px] uppercase tracking-[0.2em] text-tertiary">
                XP Gain Rate
              </span>
              <div className="text-3xl font-black text-white">+24.5%</div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-lowest">
                <div className="h-full w-3/4 bg-tertiary shadow-[0_0_10px_rgba(255,183,131,0.5)]" />
              </div>
            </div>
            <div className="glass-card rounded-xl border border-outline-variant/20 p-6">
              <span className="font-label mb-2 block text-[10px] uppercase tracking-[0.2em] text-primary">
                Sync Status
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_#c0c1ff]" />
                <span className="font-bold text-white">Encrypted</span>
              </div>
              <div className="-space-x-2 mt-4 flex">
                <div className="h-8 w-8 rounded-full border-2 border-surface bg-surface-container-highest" />
                <div className="h-8 w-8 rounded-full border-2 border-surface bg-surface-container-high" />
                <div className="h-8 w-8 rounded-full border-2 border-surface bg-surface-container-low" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="relative overflow-hidden bg-surface-container-lowest py-24">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="mb-20">
            <h2 className="font-label mb-4 text-sm uppercase tracking-[0.4em] text-primary">
              In the app
            </h2>
            <h3 className="text-5xl font-black tracking-tighter text-on-surface">
              THREE WAYS TO <br />
              PICK WHAT&apos;S NEXT.
            </h3>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-xl border border-outline-variant/20 bg-surface p-8 transition-all duration-500 hover:border-primary/40">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded bg-surface-container-high text-primary transition-transform group-hover:scale-110">
                <IconQuickGamePick className="size-7" />
              </div>
              <h4 className="mb-4 text-2xl font-bold text-white">Quick Game Pick</h4>
              <p className="leading-relaxed text-on-surface-variant">
                Describe what you feel like playing in your own words. We blend that prompt with your Steam
                taste profile and a cross-platform RAWG catalog, then you can regenerate until a pick feels
                right.
              </p>
            </div>
            <div className="group rounded-xl border border-outline-variant/20 bg-surface p-8 transition-all duration-500 hover:border-primary/40">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded bg-surface-container-high text-primary transition-transform group-hover:scale-110">
                <IconRiftSuggestions className="size-7" />
              </div>
              <h4 className="mb-4 text-2xl font-bold text-white">Rift Suggestions</h4>
              <p className="leading-relaxed text-on-surface-variant">
                Discovery Radar scores games from your library and playtime drift—not just genres—then
                surfaces a browsable grid with search, filters, platform tags, and full detail pages with
                RAWG reviews.
              </p>
            </div>
            <div className="group rounded-xl border border-outline-variant/20 bg-surface p-8 transition-all duration-500 hover:border-primary/40">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded bg-surface-container-high text-primary transition-transform group-hover:scale-110">
                <IconPlayTogether className="size-7" />
              </div>
              <h4 className="mb-4 text-2xl font-bold text-white">Play together</h4>
              <p className="leading-relaxed text-on-surface-variant">
                Compare your Steam library with any public profile by URL or ID—no friend list required. See
                overlapping picks, per-person suggestions, and co-op ideas matched to both of your tastes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="bg-surface py-24">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-8 lg:grid-cols-12">
          <div className="relative lg:col-span-7">
            <div className="absolute -left-10 -top-10 h-40 w-40 bg-primary/10 blur-[100px]" />
            <div className="relative overflow-hidden rounded-2xl border border-outline-variant/20 shadow-2xl">
              <img
                alt=""
                className="aspect-video w-full object-cover grayscale transition-all group-hover:grayscale-0"
                src={ASYMMETRIC_IMG}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="font-label mb-1 text-[10px] uppercase tracking-[0.3em] text-tertiary">
                    Live Feed
                  </div>
                  <div className="text-lg font-bold text-white">Atmospheric Simulation Active</div>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-2 animate-ping rounded-full bg-error" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-5">
            <h2 className="text-4xl font-black tracking-tight text-on-surface">
              THE &quot;INTELLIGENT VOID&quot; INTERFACE.
            </h2>
            <p className="text-lg leading-relaxed text-on-surface-variant">
              Experience a UI that stays out of your way. Deep obsidian tones and liquid transitions ensure
              that the only thing you focus on is your next digital adventure.
            </p>
            <ul className="space-y-4">
              <li className="group flex items-center gap-4">
                <span className="material-symbols-outlined text-primary transition-transform group-hover:rotate-12">
                  bolt
                </span>
                <span className="font-bold text-white">Sub-10ms Library Analysis</span>
              </li>
              <li className="group flex items-center gap-4">
                <span className="material-symbols-outlined text-primary transition-transform group-hover:rotate-12">
                  auto_awesome
                </span>
                <span className="font-bold text-white">Generative Discovery Queues</span>
              </li>
              <li className="group flex items-center gap-4">
                <span className="material-symbols-outlined text-primary transition-transform group-hover:rotate-12">
                  security
                </span>
                <span className="font-bold text-white">End-to-End Steam Privacy</span>
              </li>
            </ul>
            <div className="pt-4">
              <Link
                className="inline-flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
                href="/dashboard"
              >
                Learn about the Engine <IconArrowForward className="size-5 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-24">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black text-white">POPULAR ON RAWG RIGHT NOW</h2>
              <p className="mt-2 max-w-xl text-on-surface-variant">
                Recently added titles from the catalog Playrift uses—Steam linking still personalizes your
                dashboard picks.
              </p>
            </div>
            <a
              href="https://rawg.io/discover"
              target="_blank"
              rel="noopener noreferrer"
              className="font-label shrink-0 text-xs uppercase tracking-widest text-slate-500 transition-colors hover:text-primary"
            >
              Browse RAWG Discover
            </a>
          </div>
          <HomePopularGames games={popularGames} />
        </div>
      </section>

      <section className="relative bg-surface py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-[1440px] px-8 text-center">
          <h2 className="mb-8 text-5xl font-black tracking-tighter text-white md:text-7xl">
            THE RIFT IS <span className="italic text-primary">WAITING.</span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-on-surface-variant">
            Link Steam in under a minute to personalize recommendations, Quick Game Pick, and friend
            comparisons—plus a cross-platform game catalog, not PC-only.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded bg-primary-container px-10 py-5 text-xl font-black text-on-primary-container transition-all hover:shadow-[0_0_40px_rgba(128,131,255,0.4)]"
            >
              CONNECT STEAM NOW
            </Link>
            <Link
              href="/ai-models"
              className="glass-card rounded border border-outline-variant/30 px-10 py-5 text-xl font-black text-white transition-all hover:bg-surface-container-high"
            >
              EXPLORE AI MODELS
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/50 bg-[#0b1326] font-label text-xs uppercase tracking-widest">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between px-8 py-12 md:flex-row">
          <div className="mb-8 md:mb-0">
            <div className="mb-2 text-lg font-bold text-slate-200">Playrift AI</div>
            <div className="normal-case tracking-normal text-slate-500">
              Unlocking digital potential through neural analysis.
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-10">
            <a className="text-slate-500 transition-colors duration-200 hover:text-[#ffb783]" href="#">
              Privacy
            </a>
            <a className="text-slate-500 transition-colors duration-200 hover:text-[#ffb783]" href="#">
              Terms
            </a>
            <a className="text-slate-500 transition-colors duration-200 hover:text-[#ffb783]" href="#">
              API
            </a>
            <a className="text-slate-500 transition-colors duration-200 hover:text-[#ffb783]" href="#">
              Support
            </a>
          </div>
          <div className="mt-8 text-center text-slate-500 md:mt-0 md:text-right">
            © 2026 Playrift AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
