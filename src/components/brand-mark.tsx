import { cn } from "@/lib/utils";

/**
 * Option A wordmark: Ship + teal x402 (no SVG). Tile keeps the compact Sx mark
 * for footer / app chrome.
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
  const text =
    variant === "wordmark"
      ? size === "lg"
        ? "text-2xl sm:text-3xl"
        : size === "sm"
          ? "text-[1.125rem]"
          : "text-xl sm:text-[1.375rem]"
      : size === "lg"
        ? "text-xl sm:text-2xl"
        : size === "sm"
          ? "text-sm"
          : "text-base";
  const box = size === "lg" ? "size-11" : size === "sm" ? "size-7" : "size-9";
  const letter = size === "lg" ? "text-sm" : "text-xs";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        variant === "wordmark" && "items-baseline gap-2",
        className,
      )}
    >
      {variant === "tile" ? (
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
      ) : null}
      <div className="min-w-0 leading-tight">
        <div className={cn("font-semibold tracking-tight text-fg leading-none", text)}>
          Ship <span className="font-semibold text-primary">x402</span>
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
