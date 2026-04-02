import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="full-width bottom-0 border-t border-slate-800/50 bg-[#0b1326] font-label text-xs uppercase tracking-widest">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-8 px-8 py-12 md:flex-row md:items-start">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="text-lg font-bold text-slate-200">Playrift AI</span>
          <span className="text-slate-500">© 2024 Playrift AI. All rights reserved.</span>
        </div>
        <div className="flex gap-12">
          <div className="flex flex-col gap-3">
            <span className="mb-1 font-bold text-slate-200">Product</span>
            <Link
              className="text-slate-500 opacity-100 transition-colors duration-200 hover:text-[#ffb783] hover:opacity-80"
              href="#"
            >
              Privacy
            </Link>
            <Link
              className="text-slate-500 opacity-100 transition-colors duration-200 hover:text-[#ffb783] hover:opacity-80"
              href="#"
            >
              Terms
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="mb-1 font-bold text-slate-200">Developer</span>
            <Link
              className="text-slate-500 opacity-100 transition-colors duration-200 hover:text-[#ffb783] hover:opacity-80"
              href="#"
            >
              API
            </Link>
            <Link
              className="text-slate-500 opacity-100 transition-colors duration-200 hover:text-[#ffb783] hover:opacity-80"
              href="#"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
