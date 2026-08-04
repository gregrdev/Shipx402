import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Wallet,
} from "lucide-react";
import { SiteChrome } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd, learningResourceJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { X402_TUTORIAL_STEPS } from "@/lib/x402";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.learn, {
      jsonLd: [
        learningResourceJsonLd(
          SEO_PAGES.learn,
          "x402 protocol, HTTP 402 payment flow, Solana micropayments",
        ),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ]),
      ],
    }),
});

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
            x402 lets an API charge a small payment before it returns data. No account
            required. Read the loop below, then practice in the app.
          </p>
          <p className="text-base text-muted">
            Prefer a longer explainer?{" "}
            <Link to="/guides/what-is-x402" className="link-readable font-medium">
              What is x402?
            </Link>
          </p>

          <div className="not-prose mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-subtle">
              New here? Start in this order
            </p>
            <ol className="space-y-1.5 text-sm text-muted">
              <li>
                1.{" "}
                <Link to="/guides/what-is-x402" className="link-readable font-medium">
                  What is x402?
                </Link>{" "}
                — the plain-English idea
              </li>
              <li>
                2.{" "}
                <Link
                  to="/guides/first-solana-wallet"
                  className="link-readable font-medium"
                >
                  Your first Solana wallet
                </Link>{" "}
                — practice safely on Devnet
              </li>
              <li>3. The payment loop below — see it step by step</li>
              <li>
                4.{" "}
                <Link to="/app" className="link-readable font-medium">
                  Try the live lab
                </Link>{" "}
                — watch a payment happen
              </li>
              <li>
                5.{" "}
                <Link
                  to="/guides/ship-x402-api-solana"
                  className="link-readable font-medium"
                >
                  Ship an API
                </Link>{" "}
                or{" "}
                <Link
                  to="/guides/test-x402-endpoint"
                  className="link-readable font-medium"
                >
                  test a 402
                </Link>{" "}
                — build when ready
              </li>
            </ol>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2" aria-label="On this page">
          {[
            { href: "#payment-loop", label: "The payment loop" },
            { href: "#wallets", label: "Wallets" },
            { href: "#networks", label: "Devnet vs mainnet" },
            { href: "#next", label: "What next" },
          ].map((j) => (
            <a
              key={j.href}
              href={j.href}
              className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-muted no-underline hover:border-primary/40 hover:text-fg"
            >
              {j.label}
            </a>
          ))}
        </nav>

        <section
          id="payment-loop"
          className="scroll-mt-28 overflow-hidden rounded-[var(--radius-2xl)] border border-primary/30 hearth-panel hearth-glow"
        >
          <div className="border-b border-border/60 bg-primary/5 px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-bg/50 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <FlaskConical className="size-3.5" />
                  Core idea
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                  The payment loop
                </h2>
                <p className="max-w-xl text-base leading-relaxed text-muted">
                  x402 makes HTTP <strong className="text-fg">402 Payment Required</strong>{" "}
                  useful: the server returns a machine-readable price; you (or an agent)
                  pay; you retry with proof; the resource unlocks. Five steps.
                </p>
              </div>
              <Button asChild>
                <Link to="/app">
                  Try lab in app
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <ol className="grid gap-0 sm:grid-cols-1">
            {X402_TUTORIAL_STEPS.map((step, i) => (
              <li
                key={step.id}
                className={cn(
                  "flex gap-4 border-t border-border/50 px-5 py-5 sm:gap-5 sm:px-8",
                  i === 0 && "border-t-0",
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-sm font-semibold text-primary">
                  {step.id}
                </span>
                <div className="min-w-0 space-y-1.5">
                  <h3 className="text-base font-semibold text-fg sm:text-lg">
                    {step.title}
                  </h3>
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

          <div className="flex flex-wrap gap-3 border-t border-border/60 bg-bg/40 px-5 py-4 sm:px-8">
            <Button asChild variant="secondary" size="sm">
              <Link to="/guides/what-is-x402">What is x402?</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/guides/x402-vs-mpp">x402 vs MPP</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/guides/ship-x402-api-solana">Ship an API on Solana</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/guides/first-solana-wallet">First Solana wallet</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/guides/can-ai-agents-spend-money">Can agents spend money?</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/guides/test-x402-endpoint">Test a 402 endpoint</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/guides/facilitators-explained">Facilitators explained</Link>
            </Button>
            <a
              href="/api/x402/lab"
              className="link-readable inline-flex h-9 items-center rounded-[var(--radius-md)] px-3 text-sm font-medium"
            >
              Live lab endpoint
            </a>
          </div>
        </section>

        <section id="wallets" className="scroll-mt-28 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
              <Wallet className="size-5" />
            </div>
            <h2 className="text-xl font-semibold text-fg">Solana wallets in plain English</h2>
            <p className="mt-2 text-base leading-relaxed text-muted">
              A wallet is a <strong className="text-fg">key pair</strong>, not an app-store
              install. Public address = share to receive. Private key = never share; it is
              spending power. Ship x402 creates keys only in your browser.
            </p>
            <p className="mt-2 text-sm text-subtle">
              Read the overview, then open the practice wallet in the app.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/wallet"
                className="link-readable inline-flex items-center gap-1 text-sm font-medium"
              >
                How the wallet works
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/app"
                className="link-readable inline-flex items-center gap-1 text-sm font-medium"
              >
                Open practice wallet
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          <div
            id="networks"
            className="scroll-mt-28 rounded-[var(--radius-xl)] border border-border bg-surface p-6"
          >
            <div className="mb-3 flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-learn/15 text-learn">
              <GraduationCap className="size-5" />
            </div>
            <h2 className="text-xl font-semibold text-fg">Devnet vs mainnet</h2>
            <ul className="mt-3 space-y-2 text-base text-muted">
              <li>
                <strong className="text-fg">Learn / Devnet:</strong> free practice SOL,
                airdrops, break things safely.
              </li>
              <li>
                <strong className="text-fg">Real / Mainnet:</strong> real value. Small
                amounts in-browser; hardware wallet for savings.
              </li>
            </ul>
            <p className="mt-3 text-sm text-subtle">
              Solana Pay turns your address into a QR or <code className="text-fg">solana:</code>{" "}
              link phones can scan.
            </p>
          </div>
        </section>

        <section
          id="next"
          className="scroll-mt-28 rounded-[var(--radius-xl)] border border-border bg-surface-2/30 p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-2 text-primary">
            <BookOpen className="size-5" />
            <h2 className="text-xl font-semibold text-fg">What to do next</h2>
          </div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-base text-muted">
            <li>
              Open the{" "}
              <Link to="/app" className="link-readable font-medium">
                practice wallet
              </Link>{" "}
              and create a Devnet wallet (write down keys).
            </li>
            <li>Run the x402 Lab tab. Same five steps as above.</li>
            <li>
              Ready to build? Use the{" "}
              <Link to="/ship" className="link-readable font-medium">
                Ship generator
              </Link>
              , then{" "}
              <Link to="/check" className="link-readable font-medium">
                check your 402
              </Link>
              .
            </li>
            <li>
              Building for agents? See the{" "}
              <Link to="/agents" className="link-readable font-medium">
                agent classroom
              </Link>{" "}
              and <a href="/api/agents/curriculum" className="link-readable">curriculum JSON</a>.
            </li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/app">
                Open practice wallet
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/ship">Ship an API</Link>
            </Button>
          </div>
        </section>
      </div>
    </SiteChrome>
  );
}
