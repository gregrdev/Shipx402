import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Shield,
  ShieldAlert,
  Smartphone,
  Timer,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CLIPBOARD_CLEAR_MS,
  IDLE_LOCK_MS,
  SECURITY_FACTS,
  isSecureContextOk,
} from "@/lib/security";

export function SecurityPanel() {
  const [secure, setSecure] = useState(true);

  useEffect(() => {
    setSecure(isSecureContextOk());
  }, []);

  const idleMin = Math.round(IDLE_LOCK_MS / 60_000);
  const clipSec = Math.round(CLIPBOARD_CLEAR_MS / 1000);

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Safety & multi-device model
          </h2>
          <Badge variant={secure ? "success" : "danger"}>
            {secure ? "Secure browser context" : "Insecure context — Web Crypto may fail"}
          </Badge>
        </div>
        <p className="max-w-2xl text-base text-muted">
          Honest security: this is a{" "}
          <strong className="text-fg">client-side teaching wallet</strong>. We harden
          the browser session, but we cannot stop malware on your device or a key you
          paste into a phishing site.
        </p>
      </div>

      {!secure && (
        <div className="flex gap-3 rounded-[var(--radius-lg)] border border-danger/40 bg-danger-bg px-4 py-3 text-sm text-danger sm:text-base">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          Open this app over HTTPS (or localhost). Encryption and secure random need a
          secure context.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <Timer className="mb-2 size-5 text-primary" />
          <div className="text-base font-medium text-fg">Auto-lock</div>
          <p className="mt-1 text-sm text-muted">
            Unlocks clear after ~{idleMin} min idle or when the tab stays hidden.
          </p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <Shield className="mb-2 size-5 text-primary" />
          <div className="text-base font-medium text-fg">Clipboard</div>
          <p className="mt-1 text-sm text-muted">
            Private key copies are best-effort cleared after ~{clipSec}s (history
            managers may keep a copy).
          </p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <Smartphone className="mb-2 size-5 text-primary" />
          <div className="text-base font-medium text-fg">Other devices</div>
          <p className="mt-1 text-sm text-muted">
            Import key or encrypted backup yourself — we never cloud-sync secrets.
          </p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <Lock className="mb-2 size-5 text-primary" />
          <div className="text-base font-medium text-fg">Production CSP</div>
          <p className="mt-1 text-sm text-muted">
            Deployed builds set CSP +{" "}
            <code className="text-fg">frame-ancestors 'none'</code> (Nitro +
            Vercel headers). Dev stays unrestricted for HMR.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SECURITY_FACTS.map((f) => (
          <Card key={f.title}>
            <CardHeader className="mb-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-4 text-success" />
                {f.title}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">{f.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-warn/30 bg-warn-bg/30">
        <CardHeader className="mb-0">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ShieldAlert className="size-5 text-warn" />
            Recommended limits
          </CardTitle>
          <CardDescription className="text-base">
            Use Learn/Devnet for practice. Keep mainnet balances small in a browser
            wallet. For serious savings, use a hardware wallet and treat Ship x402 as
            education + light tooling (QR, x402 lab, Solana Pay demos).
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
