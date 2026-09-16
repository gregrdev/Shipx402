import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getLearnProgress, type LearnProgress } from "@/lib/learn-progress";
import { cn } from "@/lib/utils";

/**
 * Renders only when localStorage already has a learn path.
 * First visit stays empty — never a decorative Continue chip.
 */
export function ContinueLearningChip({
  hideIfPath,
  className,
}: {
  hideIfPath?: string;
  className?: string;
}) {
  const [progress, setProgress] = useState<LearnProgress | null>(null);

  useEffect(() => {
    const next = getLearnProgress();
    if (next && hideIfPath && next.path === hideIfPath) {
      setProgress(null);
      return;
    }
    setProgress(next);
  }, [hideIfPath]);

  if (!progress) return null;

  return (
    <a
      href={progress.path}
      className={cn(
        "chip inline-flex items-center gap-2 border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg no-underline hover:border-primary/40",
        className,
      )}
    >
      Continue Learning
      <span className="font-normal text-muted">· {progress.title}</span>
      <ArrowRight className="size-3.5" />
    </a>
  );
}
