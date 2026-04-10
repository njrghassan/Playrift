import type { GamePlatformRef } from "@/lib/types";

export function GamePlatformChips({
  platforms,
  className
}: {
  platforms?: GamePlatformRef[] | undefined;
  className?: string;
}) {
  if (!platforms?.length) return null;
  const max = 5;
  const shown = platforms.slice(0, max);
  const extra = platforms.length - max;
  return (
    <div className={className ?? "mt-1 flex flex-wrap gap-1"}>
      {shown.map((p) => (
        <span
          key={p.id}
          className="rounded-full bg-surface-container-high/90 px-2 py-0.5 text-[10px] font-medium text-on-surface-variant"
        >
          {p.name}
        </span>
      ))}
      {extra > 0 ? (
        <span className="self-center text-[10px] text-outline">+{extra}</span>
      ) : null}
    </div>
  );
}
