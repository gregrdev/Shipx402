import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const PHANTOM_INSTALL = "https://phantom.com/download";
const SOLFLARE_INSTALL = "https://www.solflare.com/download";

type WalletChoice = "practice" | "phantom" | "solflare";

const CHOICES: { id: WalletChoice; label: string }[] = [
  { id: "practice", label: "Practice" },
  { id: "phantom", label: "Phantom" },
  { id: "solflare", label: "Solflare" },
];

export function WalletFast() {
  const [choice, setChoice] = useState<WalletChoice>("practice");
  const browserWallet = choice === "phantom" || choice === "solflare";
  const installHref = choice === "phantom" ? PHANTOM_INSTALL : SOLFLARE_INSTALL;
  const installName = choice === "phantom" ? "Phantom" : "Solflare";

  return (
    <section
      id="wallet-fast"
      className="scroll-mt-28 rounded-[var(--radius-xl)] bg-surface p-4 rgb-frame-soft sm:p-5"
    >
      <span id="setup" className="sr-only">
        Setup
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">
          Setup
        </p>
        <span className="chip border border-primary/30 bg-bg px-2 py-0.5 text-xs font-medium text-primary">
          Devnet First
        </span>
      </div>

      <h2 className="mt-2 text-xl font-semibold tracking-tight text-fg sm:text-2xl">
        Make a Wallet Fast
      </h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
        Pick a wallet. Start on Devnet. We never ask for your seed.
      </p>

      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Choose a wallet"
      >
        {CHOICES.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={choice === c.id}
            onClick={() => setChoice(c.id)}
            className={cn(
              "chip border px-3.5 py-2 text-sm font-medium transition-colors",
              choice === c.id
                ? "border-primary/45 bg-primary/15 text-fg"
                : "border-border bg-bg text-muted hover:text-fg",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {choice === "practice" ? (
          <Button asChild>
            <Link to="/app">
              <Wallet className="size-4" />
              Practice Wallet
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="outline">
              <a href={installHref} target="_blank" rel="noreferrer">
                Install {installName}
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild>
              <Link to="/loop">
                Continue on Devnet
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/app">Practice Wallet</Link>
            </Button>
          </>
        )}
        <Link to="/wallet" className="link-readable text-sm font-medium">
          How keys work
        </Link>
        <Link to="/loop" className="link-readable text-sm font-medium">
          Already have a wallet?
        </Link>
      </div>

      {browserWallet ? (
        <p className="mt-3 text-xs text-muted">
          Official {installName} install only — Ship x402 does not host that
          wallet. After install, continue the loop on Devnet.
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-relaxed text-muted">
        Write your phrase on paper · Keep it out of camera roll · Never paste it
        into chat or an agent
      </p>
      <p className="mt-2 text-sm font-medium text-fg">
        Then walk the Loop — free cert.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-muted">{BRAND.independence}</p>
    </section>
  );
}
