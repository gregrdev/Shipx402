import { cn } from "@/lib/utils";

/** Official wordmark Option A: Ship + teal x402 text, sparse (no badge). */
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
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "sm"
        ? "text-base"
        : "text-xl sm:text-[1.375rem]";

  return (
    <div className={cn("flex min-w-0 items-baseline gap-2", className)}>
      <div className="min-w-0 leading-tight">
        <div className={cn("font-semibold tracking-tight text-fg", text)}>
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
