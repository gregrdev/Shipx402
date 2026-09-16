import { useState } from "react";
import { Copy, Heart, Loader2, Search, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  type GradeReport,
  reportToText,
} from "@/lib/check-402-grade";
import { copyText, cn } from "@/lib/utils";

export function Check402Panel({ defaultUrl = "" }: { defaultUrl?: string }) {
  const [url, setUrl] = useState(defaultUrl);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<GradeReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/check-402", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        report?: GradeReport;
        error?: string;
      };
      if (!res.ok || !data.report) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      setReport(data.report);
    } catch {
      setError("Could not reach checker");
    } finally {
      setBusy(false);
    }
  };

  const shareGrade = async (report: GradeReport) => {
    const text = `My x402 endpoint scored ${report.grade} on www.shipx402.com/check\n${url.trim() || "endpoint"}\n\nGrade your 402: https://www.shipx402.com/check`;
    await copyText(text);
    toast.success("Share text copied — paste it anywhere");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-xl)] border border-primary/30 bg-primary/5 p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="default">Free · no account</Badge>
          <span className="text-sm text-muted">
            Paste a URL → A–F grade on the 402 (headers first).
          </span>
        </div>
        <Label>API URL to check</Label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/api/premium"
            className="font-mono text-sm"
            spellCheck={false}
          />
          <Button disabled={busy || !url.trim()} onClick={() => void run()}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Check 402
          </Button>
        </div>
        <p className="mt-2 text-sm text-subtle">
          We fetch once over HTTPS with SSRF protections. Test a known 402:{" "}
          <button
            type="button"
            className="link-readable"
            onClick={() =>
              setUrl(
                typeof window !== "undefined"
                  ? `${window.location.origin}/api/x402/donate`
                  : "/api/x402/donate",
              )
            }
          >
            /api/x402/donate
          </button>{" "}
          (returns a Solana payTo — the receiving wallet address).
        </p>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-danger/30 bg-danger-bg p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {report && (
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold text-fg">Grade {report.grade}</span>
            <Badge variant={report.status === 402 ? "success" : "warn"}>
              HTTP {report.status ?? "—"}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await copyText(reportToText(report));
                toast.success("Report copied");
              }}
            >
              <Copy className="size-3.5" />
              Copy report
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void shareGrade(report)}
            >
              <Share2 className="size-3.5" />
              Share grade
            </Button>
          </div>
          <ul className="space-y-2">
            {report.items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "rounded-[var(--radius-md)] border px-3 py-2.5 text-sm",
                  item.level === "pass" && "border-success/25 bg-success-bg/40",
                  item.level === "warn" && "border-warn/30 bg-warn-bg/40",
                  item.level === "fail" && "border-danger/30 bg-danger-bg/50",
                )}
              >
                <div className="font-medium text-fg">
                  <span className="uppercase tracking-wide text-xs text-subtle">
                    {item.level}
                  </span>{" "}
                  {item.label}
                </div>
                <div className="mt-0.5 text-muted">{item.hint}</div>
              </li>
            ))}
          </ul>
          {report.bodyPreview && (
            <pre className="max-h-40 overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-[10px] text-muted">
              {report.bodyPreview}
            </pre>
          )}

          {/* Soft post-value tip — no modal, no guilt */}
          <div className="rounded-[var(--radius-md)] border border-border bg-bg/80 px-4 py-3 text-sm text-muted">
            <div className="mb-1 flex items-center gap-2 font-medium text-fg">
              <Heart className="size-3.5 text-primary" />
              This checker is free
            </div>
            <p>
              If it helped you ship or debug a 402, tip what you think it's worth
              (optional). Suggested 0.01–0.25 SOL —{" "}
              <Link to="/donate" className="link-readable">
                /donate
              </Link>
              . Need middleware?{" "}
              <Link to="/ship" className="link-readable">
                /ship
              </Link>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
