import Link from "next/link";

const HERO_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAVR_4vXbXTld-u2QvoMfN5UBcvDBCehm5bBJpwZhurYpYjt7akxOJ-1W-jdnMIywiY5qfRmixm-8SpTcZTR3APPJvhOQNFHYE3y88JwYqm-smndfuzVid6Dwl8ak3Q5_vld16KX5OW2dfovZA2hL-12fDVjx0IBzZhwFA922IXL50X7A91z4zbH986bHPunMeOmpuE1n66Y0Hb615jJPCQwkEjH42OGbkkf3ZVIrzfHPOnkOk4trk3eo2ut7W5dDV8ZOPxQEyzkfy9";

const BENTO_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAsYA-e0MU-FUgwwXGKRFmIhtLRIUqKqPGtE3Jc6UmB2fC-xokrHocDSDn2HeGdbKFfwDR38xSaXSvzBUQXdjzL9mocRWiwfi5MBh4Ly4fx4DgX_re9YBpyYciTFlegeDYORHwbXau_uVGSrrWKB2mjKs4JTm3SRK0samdyw7y6WHaNJRp3HBMI7kblJJ-CEWPg0GKEcbC58Dn6ghfql8X_OI_dtfkc7E5SkpMcBGXNzUJgtPGsVXsz8s8PGsJ5242eerdukNDXjO-c";

const ASYMMETRIC_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA1pyYcl_jt-Syq0pU3rDgQJXtIFKOjktZ6Tcahwra6pYGE5eunvSSh233I68TykePWz5LE67fpwpRaR3xHRqQkHux4y0ialTLkpIveOG69NrtLgyisW-ZI2vsHPmdIAUlRNWgt14LTN7aKlz0kxBJzPh-BsCMUwXnI7whWXz1CRJE_CidYbFSrXgLzZ2Ey7rZfMVFX_ciSz8ygLip5ZxbiDGl2wGPd67XogdlOma2yFKbXw0vDT7AJAEe00wIaw1cM4bO2BONYlUQD";

const CARD_1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDg7lDcbhPrBXVnf9CJFAARP99F1r1K0lX5eoBkA6UUN81yhrRC3Hkn4TyFpc0xCUrQmmSACmYnmj6swO4GwptZS4pFq-20FGtFateMbGcbizuPWBEWIY5v-qBCzacPHH2RigVjw3nmjr-uU-aTW6UabLgkilWLHi793hHfxL0Fg3es_zAqx75mc0Cw_iZdUAVHvhDbN_0kjuv8dyHM_4AiGjU7oZPAxj5Jo5NhvSE0XjfSpexa-ju7Ye0mr_Miq8UhOYsKZijlvJtf";

const CARD_2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC6zN5WCj8aLjkGYDEIrDBVV8LZZSiqlRDGnaX6aPPEGnBPPlBnJ-aI8P416eik4GGegAUyEOJN77bsuAlkTkJAEhHOysT-AAFC-54varYn6F1AXu0GvXXkIY0p_VceXmF_fNj2dH1WN6KcEPzJhlVaCF77ehKYOCZudjos_3efRcVixf0Nf8td1X6qscVAQ8eVe3TmYRP1ALwWTFUKHJRQTh7fTqREaT2-09GyC7baAuOzxxTj7raRMPGJHvAdne4JHBy9-eQgOihe";

const CARD_3 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAPHy-LSsNU8dVfpiT1YYA3IK2vEH8p0EyuXxs89k3QACn8yC1-hRd8dIMIuACTotHVTAjkt93TFXle_1uIIqdSa9h2aNVAkLTq0blSvsUH-hmHR6rju2yJvYcq1ZL7WcyIjNxsVeDabdMoGGiqdU-DN7zrIQFu6HlMV95EpxDwOpl6eRsVqAk3TY5h7f9UfoVcz2bf2RF88U0lAc2cx-CywADlSHRlcW-DboGVXr2DH_rsZbv5LvuA4OAhd6_IRAPTA653ILVXnfT_";

const CARD_4 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuArH87I6tcWTRwLoukKc4SYr_NjtpEpnXhyKtv59Au0qMUsQEs_VbqZ9w3x2jGnAzHjTeHw5-lCWATKaT-ZrvGxfcyhGw0eYF1q7mWniMIHQYnJTp52-xSs8WM2f6f_Iioxyob1HXmGzWz6q7Se74o0fz8mxxn8oEQRj0Vkgr72UqG7AYFNjd9FDHjcXjUdGMH9eXa2Bj5U2L-aC-Hmnhv4Fdz5JqMjzT4RWhusKZ5XVMzH74yhT6n0RM66AyNSx0ZHaFONCKYW76mq";

export default function HomePage() {
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
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <span className="material-symbols-outlined text-sm text-primary">search</span>
              </div>
              <input
                className="w-64 rounded-lg border-none bg-surface-container-lowest py-2 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-primary"
                placeholder="Search games..."
                type="search"
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
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  insights
                </span>
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
              The Intelligence
            </h2>
            <h3 className="text-5xl font-black tracking-tighter text-on-surface">
              HOW PLAYRIFT <br />
              REDEFINES PLAY.
            </h3>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-xl border border-transparent bg-surface p-8 transition-all duration-500 hover:border-primary/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded bg-surface-container-high transition-transform group-hover:scale-110">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  neurology
                </span>
              </div>
              <h4 className="mb-4 text-2xl font-bold text-white">Semantic Analysis</h4>
              <p className="leading-relaxed text-on-surface-variant">
                Our AI doesn&apos;t just look at genres. It maps mechanical preferences, narrative tropes,
                and pacing expectations across your entire history.
              </p>
            </div>
            <div className="group rounded-xl border border-transparent bg-surface p-8 transition-all duration-500 hover:border-primary/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded bg-surface-container-high transition-transform group-hover:scale-110">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  trophy
                </span>
              </div>
              <h4 className="mb-4 text-2xl font-bold text-white">Achievement DNA</h4>
              <p className="leading-relaxed text-on-surface-variant">
                Unlock hidden insights based on the way you complete games. Are you a speedrunner, a
                completionist, or an explorer? We know.
              </p>
            </div>
            <div className="group rounded-xl border border-transparent bg-surface p-8 transition-all duration-500 hover:border-primary/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded bg-surface-container-high transition-transform group-hover:scale-110">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  groups
                </span>
              </div>
              <h4 className="mb-4 text-2xl font-bold text-white">Dynamic Lobbies</h4>
              <p className="leading-relaxed text-on-surface-variant">
                Find your perfect squad. We match players not just by skill level, but by strategic
                temperament and communication style.
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
                Learn about the Engine{" "}
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-24">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-white">READY FOR BOOT?</h2>
              <p className="mt-2 text-on-surface-variant">Games currently trending in your social rift.</p>
            </div>
            <button
              type="button"
              className="font-label text-xs uppercase tracking-widest text-slate-500 transition-colors hover:text-primary"
            >
              See all games
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { fit: "94% Fit", title: "Elden Sagas", price: "$59.99", src: CARD_1 },
              { fit: "88% Fit", title: "Void Horizon", price: "$24.99", src: CARD_2 },
              { fit: "Highly Recommended", title: "Rift Tactician", price: "Free to Play", src: CARD_3 },
              { fit: "Just for You", title: "Neural Core", price: "$39.99", src: CARD_4 }
            ].map((c) => (
              <div
                key={c.title}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-highest transition-all duration-500 hover:-translate-y-2"
              >
                <img
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={c.src}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="font-label mb-2 text-[10px] uppercase text-primary">{c.fit}</div>
                  <h4 className="text-xl font-bold text-white">{c.title}</h4>
                  <div className="mt-3 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-sm font-bold text-tertiary">{c.price}</span>
                    <span className="material-symbols-outlined cursor-pointer text-white hover:text-primary">
                      add_circle
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            Join 50,000+ gamers who have already optimized their Steam experience. Total setup time: less
            than 60 seconds.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded bg-primary-container px-10 py-5 text-xl font-black text-on-primary-container transition-all hover:shadow-[0_0_40px_rgba(128,131,255,0.4)]"
            >
              CONNECT STEAM NOW
            </Link>
            <button
              type="button"
              className="glass-card rounded border border-outline-variant/30 px-10 py-5 text-xl font-black text-white transition-all hover:bg-surface-container-high"
            >
              EXPLORE AI MODELS
            </button>
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
            © 2024 Playrift AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
