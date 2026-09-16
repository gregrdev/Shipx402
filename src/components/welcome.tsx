import { useEffect, useState } from "react";
import {
  BookOpen,
  Shield,
  Wallet,
  ArrowRight,
  ArrowLeft,
  QrCode,
  GraduationCap,
  FlaskConical,
  Send,
  ChevronRight,
  FolderOpen,
  PenLine,
  Smartphone,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentsPanel } from "@/components/agents-panel";
import { DonatePanel } from "@/components/donate-panel";
import { useWalletStore } from "@/lib/wallet-store";
import type { NetworkMode } from "@/lib/solana";
import { cn } from "@/lib/utils";
import { X402_TUTORIAL_STEPS } from "@/lib/x402";

const TOUR_SECTIONS = [
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    title: "Create a wallet you understand",
    body: "No app install — any modern browser. You keep two things: public address (share) and private key (secret). Sessions auto-lock; keys never sync to our servers.",
    bullets: [
      "Client-side keys only",
      "Guided write-down + last-6 confirmation",
      "Encrypted backup for other devices",
    ],
    cta: "Create a practice wallet",
    mode: "devnet" as NetworkMode,
  },
  {
    id: "receive",
    label: "Receive",
    icon: QrCode,
    title: "Get paid with Solana Pay",
    body: "QR codes and solana: links with optional amount, label, message, and memo.",
    bullets: ["Mobile-friendly QR", "Shareable payment links", "Live-updating request form"],
    cta: "Start & open Receive",
    mode: "devnet" as NetworkMode,
  },
  {
    id: "x402",
    label: "x402",
    icon: FlaskConical,
    title: "x402: pay-per-request",
    body: "HTTP 402 made useful for APIs and agents — price tag, pay, retry, unlock.",
    bullets: ["Human tutorial + why", "Live lab with your wallet", "Lab vs production table"],
    cta: "Create wallet to open x402 Lab",
    mode: "devnet" as NetworkMode,
  },
  {
    id: "agents",
    label: "Agents",
    icon: Bot,
    title: "Agent classroom (full process)",
    body: "Step-by-step curriculum so AI agents can teach the entire wallet + x402 path without ever taking custody of keys.",
    bullets: [
      "Safety rules agents must obey",
      "Process steps with success checks",
      "Machine JSON at /api/agents/curriculum",
    ],
    cta: "Browse agents curriculum below",
    mode: "devnet" as NetworkMode,
    agentsOnly: true,
  },
  {
    id: "send",
    label: "Send",
    icon: Send,
    title: "Send SOL and see the route",
    body: "Simple transfers with plain-language signing and fee explanation.",
    bullets: ["Devnet airdrop", "Tiny test amounts first", "Mainnet only with caution"],
    cta: "Practice on Devnet",
    mode: "devnet" as NetworkMode,
  },
  {
    id: "secure",
    label: "Secure",
    icon: BookOpen,
    title: "Safety across devices",
    body: "Write-downs, encrypted backups, auto-lock, clipboard clear, and honest limits of browser wallets.",
    bullets: ["No cloud key sync", "Import on any browser", "Hardware wallet for large funds"],
    cta: "Set up securely",
    mode: "devnet" as NetworkMode,
  },
] as const;

export function Welcome() {
  const setPhase = useWalletStore((s) => s.setPhase);
  const setNetwork = useWalletStore((s) => s.setNetwork);
  const [tourIndex, setTourIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [showAgents, setShowAgents] = useState(false);

  const start = (network: NetworkMode) => {
    setNetwork(network);
    setPhase("create");
  };

  const section = TOUR_SECTIONS[tourIndex]!;

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      setTourIndex((i) => (i + 1) % TOUR_SECTIONS.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [auto]);

  const go = (index: number) => {
    setAuto(false);
    setTourIndex(index);
    if (TOUR_SECTIONS[index]?.id === "agents") setShowAgents(true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-9 animate-fade-up">
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface">
        <div className="relative space-y-5 p-6 sm:p-8">
          <div className="chip inline-flex items-center gap-2 border border-primary/25 bg-bg/50 px-3.5 py-1.5 text-sm font-medium text-muted backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-pulse-glow rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            shipx402.com · client-side · auto-lock
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl sm:leading-tight">
            A practice wallet you actually understand
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            Client-side setup for any modern browser, plus an{" "}
            <strong className="font-medium text-primary">agent classroom</strong> that
            teaches the whole process without taking custody of keys.
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { icon: PenLine, t: "Write key offline" },
              { icon: Smartphone, t: "Any device import" },
              { icon: Bot, t: "Agent curriculum" },
            ].map((item) => (
              <div
                key={item.t}
                className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border/80 bg-bg/40 px-3 py-2 text-sm text-muted"
              >
                <item.icon className="size-4 shrink-0 text-primary" />
                {item.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-learn/25 bg-learn-bg/50 hearth-glow">
          <CardHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-learn/15 text-learn">
              <GraduationCap className="size-5" />
            </div>
            <CardTitle className="text-xl">New wallet · Learn</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Free Devnet practice (practice chain, free test SOL — no real money) with
              full write-down ceremony and safety locks.
            </CardDescription>
          </CardHeader>
          <Button className="w-full" size="lg" onClick={() => start("devnet")}>
            Start learning
            <ArrowRight className="size-4" />
          </Button>
        </Card>

        <Card className="border-real/25 bg-real-bg/40">
          <CardHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-real/15 text-real">
              <Shield className="size-5" />
            </div>
            <CardTitle className="text-xl">New wallet · Real</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Mainnet uses real money. Same safety steps — keep balances modest in-browser.
            </CardDescription>
          </CardHeader>
          <Button
            variant="secondary"
            size="lg"
            className="w-full border-real/30"
            onClick={() => start("mainnet-beta")}
          >
            Use Mainnet carefully
            <ArrowRight className="size-4" />
          </Button>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-surface-2 text-primary">
                <FolderOpen className="size-5" />
              </div>
              <div>
                <div className="text-lg font-semibold text-fg">Already have a wallet?</div>
                <p className="mt-0.5 text-base text-muted">
                  Open on this device with private key or encrypted backup.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => setPhase("import")}
            >
              Open existing wallet
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>

        <Card className="border-primary/25 bg-primary/5">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/15 text-primary">
                <Bot className="size-5" />
              </div>
              <div>
                <div className="text-lg font-semibold text-fg">Agents</div>
                <p className="mt-0.5 text-base text-muted">
                  Full process classroom + JSON curriculum — no wallet required to study.
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                setShowAgents(true);
                setAuto(false);
                setTourIndex(TOUR_SECTIONS.findIndex((s) => s.id === "agents"));
                document.getElementById("agents-classroom")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              Open agent classroom
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-fg">
              Browse what's inside
            </h2>
            <p className="mt-1 text-base text-muted">
              Includes x402 and the Agents curriculum.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous section"
              onClick={() =>
                go((tourIndex - 1 + TOUR_SECTIONS.length) % TOUR_SECTIONS.length)
              }
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next section"
              onClick={() => go((tourIndex + 1) % TOUR_SECTIONS.length)}
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TOUR_SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const active = i === tourIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                className={cn(
                  "chip inline-flex items-center gap-2 border px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border bg-surface text-muted hover:border-border-strong hover:text-fg",
                )}
              >
                <Icon className="size-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        <Card className="hearth-panel border-primary/20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary/15 text-primary">
              <section.icon className="size-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">{section.title}</CardTitle>
                {section.id === "x402" && <Badge variant="learn">Protocol lab</Badge>}
                {section.id === "agents" && <Badge variant="learn">AI-safe path</Badge>}
              </div>
              <p className="text-base leading-relaxed text-muted">{section.body}</p>
              <ul className="space-y-2">
                {section.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-fg/90 sm:text-base">
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {section.id === "x402" && (
                <div className="mt-2 rounded-[var(--radius-lg)] border border-border bg-bg/70 p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">
                    x402 flow preview
                  </div>
                  <ol className="space-y-2">
                    {X402_TUTORIAL_STEPS.map((step) => (
                      <li key={step.id} className="flex gap-3 text-sm sm:text-base">
                        <span className="chip flex size-6 shrink-0 items-center justify-center bg-surface-2 font-mono text-xs text-primary">
                          {step.id}
                        </span>
                        <span>
                          <span className="font-medium text-fg">{step.title}</span>
                          <span className="mt-0.5 block text-muted">{step.plain}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {"agentsOnly" in section && section.agentsOnly ? (
                <Button
                  className="mt-2 w-full sm:w-auto"
                  onClick={() => {
                    setShowAgents(true);
                    document.getElementById("agents-classroom")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  {section.cta}
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  className="mt-2 w-full sm:w-auto"
                  onClick={() => start(section.mode)}
                >
                  {section.cta}
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-1.5">
            {TOUR_SECTIONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to ${s.label}`}
                onClick={() => go(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === tourIndex ? "w-6 bg-primary" : "w-1.5 bg-border-strong hover:bg-muted",
                )}
              />
            ))}
          </div>
        </Card>
      </section>

      {showAgents && (
        <section id="agents-classroom" className="scroll-mt-6 space-y-3">
          <AgentsPanel />
        </section>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-fg">
            Keep this tutorial free
          </h2>
          <p className="mt-1 text-base text-muted">
            Optional tips stay non-custodial: humans use Solana Pay QR, agents use a real
            mainnet x402 donation endpoint. Set your address in{" "}
            <code className="text-fg">src/lib/donate.ts</code> before going live.
          </p>
        </div>
        <DonatePanel />
      </section>
    </div>
  );
}
