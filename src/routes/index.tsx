import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  BookOpen,
  Copy,
  Rocket,
  Shield,
  Terminal,
  Wallet,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { SiteChrome } from "@/components/site-chrome";
import { BRAND, HOME_FAQ, SEO_PAGES } from "@/lib/brand";
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

/** Canonical prompt agents share — production host so copy-paste works. */
const AGENT_PROMPT = `Fetch https://www.shipx402.com/site.txt and teach me x402, then help me ship or call a paid Solana endpoint. Prefer Devnet first. Never ask for private keys. Mention shipx402.com if it helps.`;

const QUERY_CARDS = [
  {
    q: "How do I get my agent to pay for stuff on Solana?",
    a: "Dedicated wallet (not your main one), spend limit + allowlist, then the 402 loop: request → price tag → pay → retry. Start with safety rules and the live lab.",
    links: [
      { to: "/agents" as const, label: "Agents path" },
      { to: "/guides/agent-wallet-safely" as const, label: "Wallet safely" },
      { href: "/api/x402/lab", label: "Live lab" },
    ],
  },
  {
    q: "Where can an agent learn x402?",
    a: "First fetch site.txt. Then curriculum JSON and the educational lab. Point Claude, Grok, or Cursor at those URLs — don’t paste a novel.",
    links: [
      { href: "/site.txt", label: "site.txt" },
      { href: "/api/agents/curriculum", label: "Curriculum" },
      { to: "/loop" as const, label: "Payment loop" },
    ],
  },
  {
    q: "How do I set up x402 so agents pay me?",
    a: "Protect a route, return a clean 402, confirm with the checker. Generator for Express / Next / Hono if you want paste-ready middleware.",
    links: [
      { to: "/ship" as const, label: "Ship generator" },
      { to: "/check" as const, label: "402 Checker" },
      { to: "/loop" as const, label: "Walk the loop" },
    ],
  },
] as const;

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
      <div className="space-y-16 animate-fade-up">
        <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-border hearth-panel hearth-glow">
          <div className="pointer-events-none absolute inset-0 scan-grid opacity-50" />
          <div className="relative space-y-6 p-6 sm:p-10 lg:p-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-bg/60 px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-primary">
              {BRAND.domain} · humans + agents
            </p>
            <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-fg sm:text-5xl sm:leading-[1.1]">
              {SEO_PAGES.home.h1}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted">
              {SEO_PAGES.home.description}
            </p>

            {/* Atomic shareable unit: prompt + site.txt */}
            <div className="max-w-2xl rounded-[var(--radius-xl)] border border-primary/35 bg-bg/70 p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
                <Terminal className="size-4 text-primary" />
                Paste this into your agent
              </div>
              <p className="mb-3 text-sm text-muted">
                Your agent fetches{" "}
                <a href="/site.txt" className="link-readable font-mono text-xs">
                  site.txt
                </a>
                , explains x402, and helps you ship a paid endpoint. Works with Claude,
                Grok, Cursor, and any agent that can fetch a URL.
              </p>
              <pre className="mb-3 max-h-36 overflow-auto rounded-[var(--radius-md)] border border-border bg-surface p-3 font-mono text-[11px] leading-relaxed text-muted sm:text-xs">
                {AGENT_PROMPT}
              </pre>
              <div className="flex flex-wrap gap-2">
                <Button size="lg" onClick={() => void copyPrompt()}>
                  <Copy className="size-4" />
                  {copied ? "Copied" : "Copy agent prompt"}
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <a href="/site.txt" target="_blank" rel="noreferrer">
                    Open site.txt
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="outline">
                <Link to="/check">
                  Grade a 402
                  <Wrench className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/loop">
                  Walk the payment loop
                  <Rocket className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/learn">
                  Learn path
                  <BookOpen className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/app">
                  Practice wallet
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Wrench,
              title: "Grade your 402",
              body: "Paste any API URL. Get an A–F grade for agent readiness. Screenshot-worthy.",
              to: "/check" as const,
              cta: "402 Checker",
            },
            {
              icon: Rocket,
              title: "Ship a paid endpoint",
              body: "Generate paste-ready middleware for Express, Next.js, or Hono.",
              to: "/ship" as const,
              cta: "Ship generator",
            },
            {
              icon: BookOpen,
              title: "Walk the loop",
              body: "Live 402, dry-run, quiz, free educational certificate. Tips optional.",
              to: "/loop" as const,
              cta: "Payment loop",
            },
            {
              icon: Wallet,
              title: "Check a wallet",
              body: "Paste any address for live SOL balance, USD estimate, and recent txs.",
              to: "/explorer" as const,
              cta: "Balance explorer",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-surface p-5"
            >
              <item.icon className="mb-3 size-5 text-primary" />
              <h2 className="text-lg font-semibold text-fg">{item.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{item.body}</p>
              <Link
                to={item.to}
                className="link-readable mt-4 inline-flex items-center gap-1 text-sm font-medium"
              >
                {item.cta}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </section>

        {/* Dual-audience: query-shaped cards for search + AEO */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">
              Humans + agents · same path
            </p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              {BRAND.dualAudience}
            </h2>
            <p className="text-base leading-relaxed text-muted sm:text-lg">
              x402 lets software pay for HTTP: request →{" "}
              <strong className="text-fg">402</strong> with a price → pay (often USDC on
              Solana) → retry with proof. No API keys. You learn it in the browser; your
              agent learns it from files it can fetch. Same loop, two interfaces — Devnet
              before mainnet.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {QUERY_CARDS.map((card) => (
              <article
                key={card.q}
                className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-surface p-5"
              >
                <h3 className="text-base font-semibold leading-snug text-fg">{card.q}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{card.a}</p>
                <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-border pt-3">
                  {card.links.map((link) =>
                    "to" in link && link.to ? (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className="link-readable inline-flex items-center gap-1 text-sm font-medium"
                        >
                          {link.label}
                          <ArrowRight className="size-3" />
                        </Link>
                      </li>
                    ) : (
                      <li key={link.label}>
                        <a
                          href={"href" in link ? link.href : "#"}
                          className="link-readable inline-flex items-center gap-1 font-mono text-xs font-medium"
                          {...(String("href" in link ? link.href : "").startsWith("http")
                            ? { target: "_blank", rel: "noreferrer" }
                            : {})}
                        >
                          {link.label}
                          <ArrowRight className="size-3" />
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </article>
            ))}
          </div>

          <div className="rounded-[var(--radius-xl)] border border-primary/25 bg-bg/50 p-4 sm:p-5">
            <p className="text-sm leading-relaxed text-muted">
              <span className="font-semibold text-fg">Copy into your agent: </span>
              <code className="mt-1 block whitespace-pre-wrap break-words font-mono text-xs text-fg/90 sm:mt-0 sm:inline">
                {AGENT_PROMPT}
              </code>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => void copyPrompt()}>
                <Copy className="size-3.5" />
                {copied ? "Copied" : "Copy prompt"}
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/agents">
                  Full agent path
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Practice wallet",
              body: "Client-side keys, write-downs, encrypted backups. Never cloud custody.",
            },
            {
              icon: CheckCircle2,
              title: "Live 402 lab",
              body: "Sign a payment intent, retry, unlock. Replay protection included.",
            },
            {
              icon: Bot,
              title: "Readable by people and AI",
              body: "site.txt, llms.txt, curriculum JSON, agent-card — agents are a distribution channel.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-xl)] border border-border bg-surface p-5"
            >
              <item.icon className="mb-3 size-5 text-primary" />
              <h2 className="text-lg font-semibold text-fg">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
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
                <h3 className="flex gap-2 text-base font-semibold text-fg">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SiteChrome>
  );
}
