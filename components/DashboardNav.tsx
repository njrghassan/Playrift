import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export function DashboardNav() {
  return (
    <header className="sticky top-0 z-50 bg-[#161e2f] font-body shadow-[0_20px_40px_rgba(7,0,108,0.15)] antialiased">
      <nav className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-8">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter text-[#c0c1ff]"
          >
            Playrift
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              className="font-medium text-slate-400 transition-colors hover:text-slate-100"
              href="/#features"
            >
              Features
            </Link>
            <Link
              className="font-medium text-slate-400 transition-colors hover:text-slate-100"
              href="/#how"
            >
              How it Works
            </Link>
            <span className="border-b-2 border-[#c0c1ff] pb-1 font-bold text-[#c0c1ff]">
              Dashboard
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="#steam-connect"
            className="flex transform items-center gap-2 rounded border border-primary/20 px-6 py-2.5 text-[#c0c1ff] transition-all duration-300 hover:bg-[#8083ff]/10 hover:shadow-[0_0_15px_rgba(192,193,255,0.3)] active:scale-95"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
            <span className="font-label text-sm uppercase tracking-wider">
              Connect Steam
            </span>
          </a>
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}
