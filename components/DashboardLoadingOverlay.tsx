export function DashboardLoadingOverlay() {
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#161e2f]/95 backdrop-blur-sm"
      aria-busy="true"
      aria-live="polite"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF */}
      <img
        src="/pikachu-loading.gif"
        alt=""
        width={128}
        height={128}
        className="h-32 w-32 object-contain [image-rendering:pixelated]"
      />
      <p className="mt-6 font-body text-sm font-medium tracking-[0.2em] text-slate-400">
        Loading...
      </p>
    </div>
  );
}
