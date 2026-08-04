import { cn } from "@/lib/utils";

/** Official wordmark: Ship + x402 (lowercase x) */
export function BrandMark({
  className,
  size = "md",
  showDomain = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showDomain?: boolean;
}) {
  const text =
    size === "lg" ? "text-xl sm:text-2xl" : size === "sm" ? "text-sm" : "text-base";
  const box =
    size === "lg" ? "size-11" : size === "sm" ? "size-7" : "size-9";
  const letter = size === "lg" ? "text-sm" : "text-xs";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/15 font-mono font-bold tracking-tight text-primary hearth-glow",
          box,
          letter,
        )}
        aria-hidden
      >
        Sx
      </div>
      <div className="min-w-0 leading-tight">
        <div className={cn("font-semibold tracking-tight text-fg", text)}>
          Ship <span className="text-primary">x402</span>
        </div>
        {showDomain && (
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-subtle">
            shipx402.com
          </div>
        )}
      </div>
    </div>
  );
}
