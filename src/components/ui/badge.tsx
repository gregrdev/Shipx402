import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "learn" | "real" | "success" | "warn" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-surface-2 text-muted border border-border",
        variant === "learn" && "bg-learn-bg text-learn border border-learn/25",
        variant === "real" && "bg-real-bg text-real border border-real/25",
        variant === "success" &&
          "bg-success-bg text-success border border-success/25",
        variant === "warn" && "bg-warn-bg text-warn border border-warn/25",
        variant === "danger" &&
          "bg-danger-bg text-danger border border-danger/25",
        className,
      )}
      {...props}
    />
  );
}
