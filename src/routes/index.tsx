import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Copy,
  Rocket,
  Search,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { SiteChrome } from "@/components/site-chrome";
import { WalletFast } from "@/components/wallet-fast";
import { ContinueChip } from "@/components/continue-chip";
import { HOME_FAQ, SEO_PAGES } from "@/lib/brand";
import { AGENT_PROMPT } from "@/lib/learn-progress";
import {
  pageHead,
  orgJsonLd,
  webSiteJsonLd,
  softwareAppJsonLd,
  faqPageJsonLd,
} from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.home, {
      jsonLd: [orgJsonLd(), webSiteJsonLd(), softwareAppJsonLd(), faqPageJsonLd()],
    }),
});

function HomePage() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    await copyText(AGENT_PROMPT);
    setCopied(true);
    toast.success("Agent prompt copied — paste it into Claude, Grok, or Cursor");
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SiteChrome activePath="/">
      <div className="space-y-8 animate-fade-up">
        <section className="mx-auto max-w-2xl space-y-3 py-2 text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl sm:leading-[1.15]">
            {SEO_PAGES.home.h1}
          </h1>
          <p className="text-base text-muted sm:text-lg">
            Devnet-first x402 on Solana — humans and agents, same loop.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button asChild>
              <a href="#wallet-fast">Make a Wallet Fast</a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/learn">
                Learn Path
                <BookOpen className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="flex justify-center">
            <ContinueChip />
          </div>
        </section>

        <WalletFast />

        <div className="flex flex-col gap-2 rounded-[var(--radius-xl)] border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Agents: fetch https://www.shipx402.com/site.txt first — not a second start-here.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => void copyPrompt()}>
              <Copy className="size-3.5" />
              {copied ? "Copied" : "Copy prompt"}
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/site.txt" target="_blank" rel="noreferrer">
                Open site.txt
                <ArrowRight className="size-3.5" />
              </a>
            </Button>
          </div>
        </div>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-5">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">
            Learn Fast
          </p>
          <nav
            className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2"
            aria-label="Learn Fast"
          >
            <Link
              to="/guides/what-is-x402"
              className="link-readable text-sm font-medium"
            >
              What Is x402
            </Link>
            <Link to="/loop" className="link-readable text-sm font-medium">
              Walk the Loop
            </Link>
            <Link to="/learn" className="link-readable text-sm font-medium">
              Full
            </Link>
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm text-muted">
              Full Learning Path — beginner → advanced, matching docs.x402.org.
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link to="/learn">
                Open Learn
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Wrench,
              title: "Grade Your 402",
              body: "Paste any API URL. Get an A–F grade for agent readiness.",
              to: "/check" as const,
              cta: "402 Checker",
            },
            {
              icon: Rocket,
              title: "Ship a Paid Endpoint",
              body: "Generate paste-ready middleware for Express, Next.js, or Hono.",
              to: "/ship" as const,
              cta: "Ship Generator",
            },
            {
              icon: Search,
              title: "Check a Wallet",
              body: "Paste any address for live SOL balance, USD estimate, and recent txs.",
              to: "/explorer" as const,
              cta: "Balance Explorer",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-surface p-4"
            >
              <div className="flex flex-row items-center gap-2.5">
                <item.icon className="size-5 shrink-0 text-primary" aria-hidden />
                <h2 className="text-base font-semibold text-fg">{item.title}</h2>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{item.body}</p>
              <Link
                to={item.to}
                className="link-readable mt-3 inline-flex items-center gap-1 text-sm font-medium"
              >
                {item.cta}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">FAQ</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {HOME_FAQ.map((item) => (
              <div
                key={item.q}
                className="rounded-[var(--radius-xl)] border border-border bg-surface p-5"
              >
                <h3 className="text-base font-semibold text-fg">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SiteChrome>
  );
}
