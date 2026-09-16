import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
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

/** Freeze SoT chips — verbatim; first-viewport Home row (not RGB). */
const TRUST_CHIPS = [
  "Free to learn",
  "Devnet-first",
  "No key custody",
  "Independent",
  "NFA",
] as const;

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
        <section className="mx-auto max-w-4xl space-y-4 py-2 text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl sm:leading-[1.15]">
            {SEO_PAGES.home.h1}
          </h1>
          <p className="text-base text-muted sm:text-lg">
            Humans and agents learn the same payment loop. Practice on Devnet. Never
            share private keys.
          </p>
          <p className="text-sm text-muted">
            x402 — pay-per-request over HTTP 402; the wallet is the credential.
            Solana — chain we teach first for these payments.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1">
            <a href="#wallet-fast" className="link-readable text-sm font-medium">
              Make a Wallet Fast
            </a>
            <Link to="/learn" className="link-readable text-sm font-medium">
              Learn Path
            </Link>
          </div>
          <div className="flex justify-center">
            <ContinueChip />
          </div>
          <ul
            className="flex flex-wrap items-center justify-center gap-2"
            aria-label="Trust"
          >
            {TRUST_CHIPS.map((chip) => (
              <li
                key={chip}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                <span className="chip border border-border bg-bg px-3 py-1.5 text-sm font-medium text-fg">
                  {chip}
                </span>
                {chip === "Devnet-first" ? (
                  <span className="text-sm text-muted">
                    practice network · free test money
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <WalletFast />

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted">Paste into your agent</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="secondary" onClick={() => void copyPrompt()}>
              <Copy className="size-4" />
              {copied ? "Copied" : "Copy agent prompt"}
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href="https://www.shipx402.com/site.txt"
                target="_blank"
                rel="noreferrer"
              >
                Open site.txt
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted">
            Devnet · practice network · free test money
          </p>
        </div>

        <section
          id="learn-fast"
          className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-5"
        >
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">
            Learn Fast
          </p>
          <nav
            className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2"
            aria-label="Learn Fast"
          >
            <Link
              to="/guides/what-is-x402"
              className="link-readable text-sm font-medium"
            >
              1. What Is x402
            </Link>
            <Link to="/loop" className="link-readable text-sm font-medium">
              2. Walk the Loop
            </Link>
            <Link to="/learn" className="text-sm text-subtle hover:text-muted">
              Full
            </Link>
          </nav>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Wrench,
              title: "Grade your 402",
              body: "Paste a URL. A–F grade on the 402 (headers first). Free · no account.",
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

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-fg">FAQ</h2>
          <div className="space-y-2">
            {HOME_FAQ.map((item) => (
              <details
                key={item.q}
                className="rounded-[var(--radius-xl)] border border-border bg-surface px-5 py-3"
              >
                <summary className="cursor-pointer text-base font-semibold text-fg">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </SiteChrome>
  );
}
