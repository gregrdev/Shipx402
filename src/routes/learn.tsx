import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Layers,
  Rocket,
  Wallet,
} from "lucide-react";
import { SiteChrome } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd, learningResourceJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X402_TUTORIAL_STEPS } from "@/lib/x402";
import {
  LEARNING_PATH,
  LEVEL_META,
  type GuideLevel,
  type LearningItem,
} from "@/lib/learning-path";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.learn, {
      jsonLd: [
        learningResourceJsonLd(
          SEO_PAGES.learn,
          "x402 protocol, HTTP 402 payment flow, Solana micropayments, agent wallets",
        ),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ]),
      ],
    }),
});

const LEVELS: GuideLevel[] = ["beginner", "intermediate", "advanced"];

function LearnPage() {
  return (
    <SiteChrome activePath="/learn">
      <div className="space-y-12 animate-fade-up">
        <header className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
            Learn
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {SEO_PAGES.learn.h1}
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            One path from first concepts to agent-safe production, matching the
            official docs.x402.org flow: what x402 is → buyer payment loop → wallet →
            V2 headers / CAIP-2 → facilitators → ship a paid route.
          </p>
        </header>

        <nav
          className="flex flex-wrap gap-2"
          aria-label="Jump to section"
        >
          {[
            { href: "#path", label: "Full Path" },
            { href: "#payment-loop", label: "Payment Loop" },
            { href: "#wallets", label: "Wallets" },
            { href: "#tools", label: "Tools" },
          ].map((j) => (
            <a
              key={j.href}
              href={j.href}
              className="chip border border-border bg-surface px-3.5 py-2 text-sm font-medium text-muted no-underline transition-colors hover:border-primary/40 hover:text-fg"
            >
              {j.label}
            </a>
          ))}
        </nav>

        <section id="path" className="scroll-mt-28 space-y-8">
          <span id="learn-x402" className="sr-only">
            Learn x402 path
          </span>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-fg">
                Full Learning Path
              </h2>
              <p className="mt-1 text-base text-muted">
                Follow the order within each tier. Skip ahead only if you already know
                the earlier material.
              </p>
            </div>
            <Badge variant="learn">Updated Sep 2026</Badge>
          </div>

          {LEVELS.map((level) => {
            const meta = LEVEL_META[level];
            const items = LEARNING_PATH.filter((i) => i.level === level);
            return (
              <div
                key={level}
                id={level}
                className="scroll-mt-28 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface"
              >
                <div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-bg/40 px-5 py-4 sm:px-6">
                  <span
                    className={cn(
                      "chip inline-flex items-center gap-2 border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                      level === "beginner" &&
                        "border-learn/30 bg-learn-bg text-learn",
                      level === "intermediate" &&
                        "border-primary/30 bg-primary/10 text-primary",
                      level === "advanced" &&
                        "border-ember/30 bg-real-bg text-ember",
                    )}
                  >
                    {level === "beginner" && <GraduationCap className="size-3.5" />}
                    {level === "intermediate" && <Layers className="size-3.5" />}
                    {level === "advanced" && <Rocket className="size-3.5" />}
                    {meta.label}
                  </span>
                  <p className="text-sm text-muted">{meta.description}</p>
                </div>
                <ol className="divide-y divide-border/50">
                  {items.map((item, idx) => (
                    <li key={item.path + item.title}>
                      <LearningPathLink item={item} idx={idx} />
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </section>

        <section
          id="payment-loop"
          className="scroll-mt-28 overflow-hidden rounded-[var(--radius-2xl)] border border-transparent hearth-panel rgb-frame"
        >
          <div className="border-b border-border/60 bg-primary/5 px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="chip inline-flex items-center gap-2 border border-primary/30 bg-bg/50 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <FlaskConical className="size-3.5" />
                  Core Idea · V2 Lab
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                  The Payment Loop
                </h2>
                <p className="max-w-xl text-base leading-relaxed text-muted">
                  x402 makes HTTP{" "}
                  <strong className="text-fg">402 Payment Required</strong> useful.
                  V2 puts the price in{" "}
                  <code className="text-fg">PAYMENT-REQUIRED</code>, the retry in{" "}
                  <code className="text-fg">PAYMENT-SIGNATURE</code>, and settlement
                  in <code className="text-fg">PAYMENT-RESPONSE</code>. Five steps.
                </p>
              </div>
              <Button asChild>
                <Link to="/app">
                  Try Lab in App
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <ol className="grid gap-0">
            {X402_TUTORIAL_STEPS.map((step, i) => (
              <li
                key={step.id}
                className={cn(
                  "border-t border-border/50 px-5 py-5 sm:px-8",
                  i === 0 && "border-t-0",
                )}
              >
                <h3 className="flex flex-row items-center gap-3 text-base font-semibold text-fg sm:text-lg">
                  <span className="step-num">{step.id}</span>
                  {step.title}
                </h3>
                <div className="mt-1.5 space-y-1.5 pl-[calc(2.5rem+0.75rem)]">
                  <p className="text-sm leading-relaxed text-muted sm:text-base">
                    {step.plain}
                  </p>
                  <p className="text-sm text-subtle">
                    <span className="font-medium text-muted">Why: </span>
                    {step.why}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="wallets" className="scroll-mt-28 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6 cyber-edge">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-fg">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                <Wallet className="size-5" />
              </span>
              Solana Wallets in Plain English
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted">
              A wallet is a <strong className="text-fg">key pair</strong>. Public =
              share to receive. Private = never share. Ship x402 creates keys only in
              your browser.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/wallet"
                className="link-readable inline-flex items-center gap-1 text-sm font-medium"
              >
                How the Wallet Works
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/app"
                className="link-readable inline-flex items-center gap-1 text-sm font-medium"
              >
                Open Practice Wallet
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          <div className="scroll-mt-28 rounded-[var(--radius-xl)] border border-border bg-surface p-6">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-fg">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-learn/15 text-learn">
                <GraduationCap className="size-5" />
              </span>
              Devnet vs Mainnet
            </h2>
            <ul className="mt-3 space-y-2 text-base text-muted">
              <li>
                <strong className="text-fg">Learn / Devnet:</strong> free practice SOL,
                break things safely.
              </li>
              <li>
                <strong className="text-fg">Real / Mainnet:</strong> real value. Small
                amounts in-browser; hardware for savings.
              </li>
            </ul>
          </div>
        </section>

        <section
          id="tools"
          className="scroll-mt-28 rounded-[var(--radius-xl)] border border-border bg-surface-2/30 p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-2 text-primary">
            <BookOpen className="size-5" />
            <h2 className="text-xl font-semibold text-fg">Tools When You Are Ready</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                to: "/ship" as const,
                title: "Ship Generator",
                body: "Paste-ready Express / Next / Hono v2 middleware.",
              },
              {
                to: "/check" as const,
                title: "402 Checker",
                body: "Grade a public endpoint’s 402 body.",
              },
              {
                to: "/explorer" as const,
                title: "Balance Explorer",
                body: "Look up any wallet’s SOL balance and recent txs.",
              },
              {
                to: "/agents" as const,
                title: "Agent Classroom",
                body: "Curriculum + safety rules machines can fetch.",
              },
            ].map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 no-underline transition-colors hover:border-primary/40"
              >
                <div className="font-semibold text-fg">{t.title}</div>
                <p className="mt-1 text-sm text-muted">{t.body}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/app">
                Open Practice Wallet
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/guides/what-is-x402">Start: What Is x402?</Link>
            </Button>
          </div>
        </section>
      </div>
    </SiteChrome>
  );
}

function LearningPathLink({ item, idx }: { item: LearningItem; idx: number }) {
  const inner = (
    <>
      <span className="chip flex size-8 shrink-0 items-center justify-center bg-surface-2 font-mono text-xs font-semibold text-primary">
        {idx + 1}
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-semibold text-fg">{item.title}</span>
        <span className="mt-0.5 block text-sm text-muted">{item.blurb}</span>
      </span>
      <ArrowRight className="mt-1 size-4 shrink-0 text-subtle" />
    </>
  );
  const className =
    "flex gap-4 px-5 py-4 no-underline transition-colors hover:bg-bg/50 sm:px-6";

  if (item.path.startsWith("http") || item.path.includes("#")) {
    return (
      <a href={item.path} className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link to={item.path} className={className}>
      {inner}
    </Link>
  );
}
