import { ExternalLink, Atom, Route, Shield, FlaskConical, Smartphone } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LearnPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="size-5 text-primary" />
            Using this on any phone or computer
          </CardTitle>
          <CardDescription>There is nothing to install from an app store.</CardDescription>
        </CardHeader>
        <ol className="space-y-3 text-base text-muted">
          {[
            "Open Ship x402 in Chrome, Safari, Firefox, or Edge.",
            "Create once and write down public address + private key.",
            "Optional: download the encrypted .enc.json backup + password.",
            "On a new device: Open existing wallet → paste key or upload backup.",
            "Closing the tab locks the session — that is normal and safer.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="chip flex size-7 shrink-0 items-center justify-center bg-surface-2 text-sm font-semibold text-fg">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="size-5 text-primary" />
            How a transfer routes
          </CardTitle>
          <CardDescription>What happens under the hood on Solana.</CardDescription>
        </CardHeader>
        <ol className="space-y-3 text-base text-muted">
          {[
            "You build a transaction that says “move X SOL from A to B”.",
            "Your private key signs that message so only you can authorize it.",
            "A fee payer (usually you) covers a tiny network fee in SOL.",
            "The transaction is sent to an RPC, then validators confirm it.",
            "Balances update. The signature is your receipt.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="chip flex size-7 shrink-0 items-center justify-center bg-surface-2 text-sm font-semibold text-fg">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="size-5 text-primary" />
            x402 in one minute
          </CardTitle>
          <CardDescription>Pay for an API call the same way you fetch it.</CardDescription>
        </CardHeader>
        <ul className="space-y-2 text-base text-muted">
          <li className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <strong className="text-fg">402</strong> means “this resource costs money” —
            not “log in”.
          </li>
          <li className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            The server attaches a machine-readable price (amount, chain, token).
          </li>
          <li className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            You (or an agent) pay and retry with a payment proof header.
          </li>
          <li className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            Open the <strong className="text-fg">x402 Lab</strong> tab to run it live.
          </li>
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            Security basics
          </CardTitle>
          <CardDescription>Habits that keep funds safe.</CardDescription>
        </CardHeader>
        <ul className="space-y-2 text-base text-muted">
          <li className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            Never paste your private key into Discord, Telegram, or “claim” sites.
          </li>
          <li className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            Prefer encrypted backups + a password manager over screenshots.
          </li>
          <li className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            Practice on Devnet first.{" "}
            <a
              href="https://www.shipx402.com/guides/first-solana-wallet"
              className="chip mx-1 inline-flex border border-border bg-bg px-2 py-0.5 text-xs font-medium text-muted no-underline hover:text-fg"
            >
              Devnet · practice network · free test money
            </a>{" "}
            Real mode mistakes are irreversible.
          </li>
          <li className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            Double-check recipient addresses — Solana has no undo.
          </li>
        </ul>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Atom className="size-5 text-primary" />
            Quantum readiness (5–10 year horizon)
          </CardTitle>
          <CardDescription>
            Educational overview — not a full post-quantum wallet inside this app.
          </CardDescription>
        </CardHeader>
        <div className="space-y-3 text-base text-muted">
          <p>
            Today's Solana accounts use Ed25519 signatures. Long-term storage may want
            hash-based schemes (e.g. Winternitz vaults). Master normal wallet safety first.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm font-medium text-fg hover:border-border-strong"
              href="https://github.com/blueshift-gg/winterwallet"
              target="_blank"
              rel="noreferrer"
            >
              Winterwallet
              <ExternalLink className="size-3.5 text-muted" />
            </a>
            <a
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm font-medium text-fg hover:border-border-strong"
              href="https://www.x402.org/"
              target="_blank"
              rel="noreferrer"
            >
              x402.org
              <ExternalLink className="size-3.5 text-muted" />
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
