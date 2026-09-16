import { cn } from "@/lib/utils";

/**
 * Option A: CSS/text wordmark (header) + compact Sx tile (footer / app).
 * No SVG, no Lucide, no hearth-glow on the wordmark path.
 */
export function BrandMark({
  className,
  size = "md",
  showDomain = false,
  variant = "wordmark",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showDomain?: boolean;
  variant?: "wordmark" | "tile";
}) {
  if (variant === "wordmark") {
    return (
      <span
        className={cn(
          "text-[1.125rem] font-semibold tracking-tight text-fg leading-none",
          className,
        )}
      >
        Ship{" "}
        <span className="text-primary font-semibold">x402</span>
      </span>
    );
  }

  const text =
    size === "lg" ? "text-xl sm:text-2xl" : size === "sm" ? "text-sm" : "text-base";
  const box = size === "lg" ? "size-11" : size === "sm" ? "size-7" : "size-9";
  const letter = size === "lg" ? "text-sm" : "text-xs";

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface font-mono font-bold tracking-tight text-primary",
          box,
          letter,
        )}
        aria-hidden
      >
        Sx
      </div>
      <div className="min-w-0 leading-tight">
        <div className={cn("font-semibold leading-none tracking-tight text-fg", text)}>
          Ship <span className="font-semibold text-primary">x402</span>
        </div>
        {showDomain ? (
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-subtle">
            shipx402.com
          </div>
        ) : null}
      </div>
    </div>
  );
}
