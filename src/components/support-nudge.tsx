import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Soft, non-beggy tip CTA. Use after value (end of guides, tools, loop, cert).
 * Never sticky, never modal, never guilt-framed.
 */
export function SupportNudge({
  className,
  compact = false,
  quiet = false,
}: {
  className?: string;
  compact?: boolean;
  /** Tools/Home-style: border-border surface, outline CTA — not filled primary. */
  quiet?: boolean;
}) {
  if (compact) {
    return (
      <p
        className={cn(
          "text-sm leading-relaxed text-muted",
          className,
        )}
      >
        Useful?{" "}
        <Link
          to="/donate"
          className="font-medium text-primary underline decoration-primary/50 underline-offset-2 hover:decoration-primary"
        >
          Tip what you think it's worth
        </Link>
        <span className="text-subtle"> — optional.</span>
      </p>
    );
  }

  return (
    <aside
      className={cn(
        "not-prose rounded-[var(--radius-xl)] p-5 sm:p-6",
        quiet
          ? "border border-border bg-surface"
          : "border border-primary/20 bg-primary/5",
        className,
      )}
      aria-label="Optional support"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)]",
            quiet ? "bg-surface-2 text-muted" : "bg-primary/15 text-primary",
          )}
        >
          <Heart className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-base font-semibold text-fg">
            If this helped, tip what you think it's worth
          </p>
          <p className="text-sm leading-relaxed text-muted">
            Everything here stays free and public. An optional tip supports the
            site and the person building it — any amount is appreciated, nothing
            is required.
          </p>
          <Link
            to="/donate"
            className={cn(
              "chip inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold no-underline transition-colors",
              quiet
                ? "border border-border bg-surface text-fg hover:border-border-strong hover:bg-surface-2"
                : "bg-primary text-primary-fg shadow-[0_0_18px_-8px_color-mix(in_oklab,var(--color-rgb-g)_55%,transparent)] hover:bg-primary/90",
            )}
          >
            <Heart className="size-3.5" aria-hidden />
            Tip what it's worth
          </Link>
        </div>
      </div>
    </aside>
  );
}
