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
import { ContinueLearningChip } from "@/components/continue-learning";
import { SiteChrome } from "@/components/site-chrome";
import { WalletSetupStrip } from "@/components/wallet-setup-strip";
import { HOME_FAQ, SEO_PAGES } from "@/lib/brand";
import { pageHead, orgJsonLd, webSiteJsonLd, softwareAppJsonLd, faqPageJsonLd } from "@/lib/seo";
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
      { to: "/agents" as const, label: "Agents Path" },
      { to: "/guides/agent-wallet-safely" as const, label: "Wallet Safely" },
      { href: "/api/x402/lab", label: "Live Lab" },
    ],
  },
  {
    q: "Where can an agent learn x402?",
    a: "First fetch site.txt. Then curriculum JSON and the educational lab. Point Claude, Grok, or Cursor at those URLs — don’t paste a novel.",
    links: [
      { href: "/site.txt", label: "site.txt" },
      { href: "/api/agents/curriculum", label: "Curriculum" },
      { to: "/loop" as const, label: "Payment Loop" },
    ],
  },
  {
    q: "How do I set up x402 so agents pay me?",
    a: "Protect a route, return a clean 402, confirm with the checker. Generator for Express / Next / Hono if you want paste-ready middleware.",
    links: [
      { to: "/ship" as const, label: "Ship Generator" },
      { to: "/check" as const, label: "402 Checker" },
      { to: "/loop" as const, label: "Walk the Loop" },
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
      <div className="space-y-10 animate-fade-up">
        <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface">
          <div className="cyber-rails" aria-hidden="true">
            <span className="cyber-rail cyber-rail-l" />
            <span className="cyber-rail cyber-rail-r" />
          </div>
          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center justify-center space-y-4 px-5 py-6 text-center sm:px-7 sm:py-8">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-fg sm:text-4xl sm:leading-[1.15]">
              {SEO_PAGES.home.h1}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Free learn. Devnet first. We never ask for your seed.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a href="#setup" className="link-readable text-base font-semibold">
                Make a Wallet Fast
              </a>
              <Link to="/learn" className="link-readable text-base font-semibold">
                Learn Path
              </Link>
            </div>
            <ContinueLearningChip />
          </div>
        </section>

        <WalletSetupStrip />

        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface px-4 py-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Terminal className="size-4 shrink-0 text-primary" aria-hidden />
            <span>Paste this into your agent</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => void copyPrompt()}>
              <Copy className="size-3.5" />
              {copied ? "Copied" : "Copy Agent Prompt"}
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/site.txt" target="_blank" rel="noreferrer">
                Open site.txt
                <ArrowRight className="size-3.5" />
              </a>
            </Button>
          </div>
        </section>

        <section
          id="learn-fast"
          className="mx-auto w-full max-w-3xl scroll-mt-28 space-y-4 text-center"
        >
          <h2 className="flex items-center justify-center gap-2 text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            <BookOpen className="size-5 text-primary" aria-hidden />
            Learn Fast
          </h2>
          <ol className="grid gap-3 sm:grid-cols-2">
            {[
              {
                n: "1",
                title: "What Is x402",
                to: "/guides/what-is-x402" as const,
                body: "The plain-English idea behind HTTP 402.",
              },
              {
                n: "2",
                title: "Walk the Loop",
                to: "/loop" as const,
                body: "Live 402, dry-run, quiz, free cert.",
              },
            ].map((step) => (
              <li key={step.to}>
                <Link
                  to={step.to}
                  className="flex h-full flex-col rounded-[var(--radius-xl)] border border-border bg-surface p-4 text-left no-underline transition-colors hover:border-border-strong"
                >
                  <span className="flex items-center gap-2 font-semibold text-fg">
                    <span className="step-num !size-8 !text-sm">{step.n}</span>
                    {step.title}
                  </span>
                  <span className="mt-2 text-sm text-muted">{step.body}</span>
                </Link>
              </li>
            ))}
          </ol>
          <Link to="/learn" className="link-readable text-sm font-medium">
            Full path
          </Link>
        </section>

        <section className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-3">
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
              icon: Wallet,
              title: "Explorer",
              body: "Paste any address for live SOL balance, USD estimate, and recent txs.",
              to: "/explorer" as const,
              cta: "Balance Explorer",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-surface p-5"
            >
              <div className="flex flex-row items-center gap-2.5">
                <item.icon className="size-5 shrink-0 text-primary" aria-hidden />
                <h2 className="text-lg font-semibold text-fg">{item.title}</h2>
              </div>
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

        <section className="space-y-6">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <p className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-primary">
              <Bot className="size-3.5" aria-hidden />
              Humans + Agents · Same Path
            </p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              You and Your Agent Learn x402 Together
            </h2>
            <p className="text-base leading-relaxed text-muted sm:text-lg">
              x402 lets software pay for HTTP: request → <strong className="text-fg">402</strong>{" "}
              with a price → pay (often USDC on Solana) → retry with proof. No API keys. You learn
              it in the browser; your agent learns it from files it can fetch. Same loop, two
              interfaces — Devnet before mainnet.
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
        </section>

        <section className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Practice Wallet",
              body: "Client-side keys, write-downs, encrypted backups. Never cloud custody.",
            },
            {
              icon: CheckCircle2,
              title: "Live 402 Lab",
              body: "Sign a payment intent, retry, unlock. Replay protection included.",
            },
            {
              icon: Bot,
              title: "Readable by People and AI",
              body: "site.txt, llms.txt, curriculum JSON, agent-card — agents are a distribution channel.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-xl)] border border-border bg-surface p-5"
            >
              <div className="flex flex-row items-center gap-2.5">
                <item.icon className="size-5 shrink-0 text-primary" aria-hidden />
                <h2 className="text-lg font-semibold text-fg">{item.title}</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold text-fg">
            <CheckCircle2 className="size-5 text-primary" aria-hidden />
            FAQ
          </h2>
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
