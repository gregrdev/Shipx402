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
}: {
  className?: string;
  compact?: boolean;
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
        "not-prose rounded-[var(--radius-xl)] border border-primary/20 bg-primary/5 p-5 sm:p-6",
        className,
      )}
      aria-label="Optional support"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary/15 text-primary">
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
            className="chip inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-fg no-underline transition-colors hover:bg-primary/90"
          >
            <Heart className="size-3.5" aria-hidden />
            Tip what it's worth
          </Link>
        </div>
      </div>
    </aside>
  );
}
