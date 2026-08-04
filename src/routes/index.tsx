import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  BookOpen,
  Rocket,
  Shield,
  Wrench,
} from "lucide-react";
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

export const Route = createFileRoute("/")({
  component: HomePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.home, {
      jsonLd: [orgJsonLd(), webSiteJsonLd(), softwareAppJsonLd(), faqPageJsonLd()],
    }),
});

function HomePage() {
  return (
    <SiteChrome activePath="/">
      <div className="space-y-16 animate-fade-up">
        <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-border hearth-panel hearth-glow">
          <div className="pointer-events-none absolute inset-0 scan-grid opacity-50" />
          <div className="relative space-y-6 p-6 sm:p-10 lg:p-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-bg/60 px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-primary">
              {BRAND.domain}
            </p>
            <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-fg sm:text-5xl sm:leading-[1.1]">
              {SEO_PAGES.home.h1}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted">
              x402 lets an API charge a small payment before it returns data. Learn the
              loop, practice a Solana wallet on Devnet, then ship and validate real 402s.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/learn">
                  New here? Start learning
                  <BookOpen className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/ship">
                  Ready to build
                  <Rocket className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/check">
                  Check a 402
                  <Wrench className="size-4" />
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

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "New here",
              body: "Plain-English lessons on what x402 is and how the payment loop works.",
              to: "/learn" as const,
              cta: "Learn x402",
            },
            {
              icon: Rocket,
              title: "Ready to build",
              body: "Generate paste-ready middleware for Express, Next.js, or Hono.",
              to: "/ship" as const,
              cta: "Ship generator",
            },
            {
              icon: Wrench,
              title: "Already have an API",
              body: "Paste a URL and grade the 402 response for agent readiness.",
              to: "/check" as const,
              cta: "402 Checker",
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
              body: "Clear pages, llms.txt, curriculum JSON, and a live donate endpoint.",
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
