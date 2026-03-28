import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <nav className="sticky top-0 z-50 bg-surface shadow-[0_20px_40px_rgba(7,0,108,0.15)]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="text-2xl font-black tracking-tighter text-primary">Playrift</div>
          <div className="hidden items-center gap-10 md:flex">
            <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Features
            </a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              How it Works
            </a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="/dashboard">
              Dashboard
            </a>
          </div>
          <div>
            <Link
              href="/signup"
              className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container hover:opacity-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
      <header className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 drift-gradient opacity-30" />
          <div className="relative rounded-3xl bg-surface-container-lowest/40 p-8 ring-1 ring-outline-variant/20 md:p-14">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-black leading-tight md:text-6xl">
                  Playrift
                  <span className="italic text-primary"> </span>
                </h1>
                <p className="mt-4 text-lg text-on-surface-variant">
                  AI-powered game recommendations based on your current gaming behavior (not just history).
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/signup"
                    className="rounded-lg bg-primary-container px-6 py-3 font-semibold text-on-primary-container hover:opacity-95"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-lg bg-surface-container-low p-3 text-sm font-semibold text-on-surface hover:bg-surface-container-highest"
                  >
                    Log in
                  </Link>
                </div>
              </div>

              <div className="hidden rounded-2xl bg-surface-container-low p-6 md:block">
                <div className="text-[10px] font-label uppercase tracking-widest text-secondary-fixed-dim">
                  Behavioral Drift
                </div>
                <div className="mt-2 text-4xl font-black text-primary">88.4%</div>
                <div className="mt-3 text-sm text-on-surface-variant">Recent sessions vs long-term baseline</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <h2 className="text-sm font-label uppercase tracking-widest text-primary">How it works</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { title: "Connect Steam profile", desc: "Paste a Steam URL or ID to link your library." },
            { title: "Analyze recent + long-term", desc: "We build genre frequencies from your play history." },
            { title: "Get personalized recommendations", desc: "We score candidate games and rank the best matches." }
          ].map((step, idx) => (
            <article
              key={step.title}
              className="rounded-2xl bg-surface-container-low p-6 ring-1 ring-outline-variant/10"
            >
              <p className="text-xs font-label uppercase tracking-widest text-secondary-fixed-dim">
                Step {idx + 1}
              </p>
              <h3 className="mt-3 text-xl font-bold text-on-surface">{step.title}</h3>
              <p className="mt-2 text-sm text-on-surface-variant">{step.desc}</p>
            </article>
          ))}
        </div>
      </section>
      </main>
    </div>
  );
}
