import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { readLearnProgress } from "@/lib/learn-progress";

/**
 * Home + Learn only. Hidden on an empty first visit (no localStorage row).
 */
export function ContinueChip() {
  const [progress, setProgress] = useState<ReturnType<typeof readLearnProgress>>(
    null,
  );

  useEffect(() => {
    setProgress(readLearnProgress());
  }, []);

  if (!progress) return null;

  return (
    <a
      href={progress.path}
      className="chip inline-flex items-center gap-1.5 border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg no-underline hover:border-primary/40"
    >
      Continue
      <span className="text-muted">· {progress.label}</span>
      <ArrowRight className="size-3.5 text-muted" />
    </a>
  );
}
