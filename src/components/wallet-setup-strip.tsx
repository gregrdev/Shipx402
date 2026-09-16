import { Link } from "@tanstack/react-router";
import { ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WALLET_INSTALL } from "@/lib/brand";

/** Video Concept v1.1 — frozen, do not paraphrase. */
export const WALLET_FAST_COPY = {
  title: "Make a Wallet Fast",
  deck: "Pick a wallet. Start on Devnet. We never ask for your seed.",
  bridge: "Then walk the Loop — free cert.",
  alreadyHave: "I already have a wallet",
  howKeys: "How keys work",
  practice: "Practice",
  continueDevnet: "Continue on Devnet",
  phantom: "Phantom",
  solflare: "Solflare",
  installPhantom: "Install Phantom",
  installSolflare: "Install Solflare",
  devnetChip: "Devnet First",
} as const;

function DevnetChip() {
  return (
    <span className="chip inline-flex items-center border border-primary/35 bg-bg/70 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
      {WALLET_FAST_COPY.devnetChip}
    </span>
  );
}

export function WalletSetupStrip() {
  return (
    <section
      id="setup"
      className="relative mx-auto w-full max-w-3xl scroll-mt-28 overflow-hidden rounded-[var(--radius-xl)] bg-surface rgb-frame"
    >
      <span id="wallet-fast" className="absolute top-0" />
      <div className="relative z-10 space-y-4 px-5 py-6 text-center sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Wallet className="size-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            {WALLET_FAST_COPY.title}
          </h2>
          <DevnetChip />
        </div>
        <p className="text-base leading-relaxed text-muted">{WALLET_FAST_COPY.deck}</p>

        <Tabs defaultValue="practice" className="mx-auto max-w-lg">
          <TabsList className="w-full justify-center">
            <TabsTrigger value="practice">{WALLET_FAST_COPY.practice}</TabsTrigger>
            <TabsTrigger value="phantom">{WALLET_FAST_COPY.phantom}</TabsTrigger>
            <TabsTrigger value="solflare">{WALLET_FAST_COPY.solflare}</TabsTrigger>
          </TabsList>

          <TabsContent value="practice" className="space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button asChild>
                <Link to="/app">
                  {WALLET_FAST_COPY.practice}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="phantom" className="space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button asChild>
                <a href={WALLET_INSTALL.phantom.installUrl} target="_blank" rel="noreferrer">
                  {WALLET_FAST_COPY.installPhantom}
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/loop">
                  {WALLET_FAST_COPY.continueDevnet}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="solflare" className="space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button asChild>
                <a href={WALLET_INSTALL.solflare.installUrl} target="_blank" rel="noreferrer">
                  {WALLET_FAST_COPY.installSolflare}
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/loop">
                  {WALLET_FAST_COPY.continueDevnet}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-sm text-muted">{WALLET_FAST_COPY.bridge}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/loop" className="link-readable text-sm font-medium">
            {WALLET_FAST_COPY.alreadyHave}
          </Link>
          <Link to="/wallet" className="link-readable text-sm font-medium">
            {WALLET_FAST_COPY.howKeys}
          </Link>
        </div>
      </div>
    </section>
  );
}
