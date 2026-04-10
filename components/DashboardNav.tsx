"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

function navClass(active: boolean) {
  return active
    ? "border-b-2 border-[#c0c1ff] pb-1 font-bold text-[#c0c1ff]"
    : "font-medium text-slate-400 transition-colors hover:text-slate-100";
}

export function DashboardNav() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isProfile = pathname === "/dashboard/profile";
  const isPlayTogether = pathname === "/dashboard/play-together";

  return (
    <header className="sticky top-0 z-50 bg-[#161e2f] font-body shadow-[0_20px_40px_rgba(7,0,108,0.15)] antialiased">
      <nav className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-8">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-black tracking-tighter text-[#c0c1ff]">
            Playrift
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              className="font-medium text-slate-400 transition-colors hover:text-slate-100"
              href="/#features"
            >
              Features
            </Link>
            <Link className="font-medium text-slate-400 transition-colors hover:text-slate-100" href="/#how">
              How it Works
            </Link>
            <Link href="/dashboard" className={navClass(isDashboard)}>
              Dashboard
            </Link>
            <Link href="/dashboard/profile" className={navClass(isProfile)}>
              Profile
            </Link>
            <Link href="/dashboard/play-together" className={navClass(isPlayTogether)}>
              Play together
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}
