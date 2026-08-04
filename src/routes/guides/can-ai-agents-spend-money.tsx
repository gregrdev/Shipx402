import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/can-ai-agents-spend-money")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.agentsSpendMoney, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.agentsSpendMoney),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          {
            name: "Can AI agents spend money",
            path: "/guides/can-ai-agents-spend-money",
          },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/can-ai-agents-spend-money">
      <Prose>
        <p className="text-sm text-subtle">Guide · Plain English · 2026</p>
        <h1>Can AI agents actually spend money now?</h1>
        <p>
          Short answer: yes, with guardrails. An AI agent can call an API, read a
          payment demand, sign a small transfer, and retry the request. That loop is the
          whole point of protocols like x402.
        </p>

        <h2>What that really means</h2>
        <p>
          It does not mean a chatbot grew a wallet and a shopping habit. It means a few
          plain mechanical steps now fit together:
        </p>
        <ul>
          <li>Software can make an HTTP request.</li>
          <li>A server can reply, "payment required," with a price and where to pay.</li>
          <li>A wallet module can approve a spend within limits you set.</li>
          <li>The server checks the payment and unlocks the result.</li>
        </ul>
        <p>
          You still choose the rules: the maximum spend, which endpoints are allowed,
          which keys exist, and where those keys live. The agent acts inside a fence you
          build.
        </p>

        <h2>Why agents needed this</h2>
        <p>
          API keys and monthly plans assume a human admin who signs up, picks a plan,
          and enters a card. Agents do not work like that. They burst, retry, and call
          many different tools, often needing one cheap request rather than a
          subscription. Paying a fraction of a cent per call fits that behavior far
          better than a sales call and a billing dashboard.
        </p>

        <h2>The agent flow</h2>
        <p>It is the same request and response loop a human developer would see:</p>
        <p>
          <code>Request → 402 → pay → retry with proof → 200</code>
        </p>
        <p>
          Good products publish clear prices in that 402 response and never ask a human
          to paste a private key into a chat window. The agent holds its own limited
          spending key and signs within policy.
        </p>

        <h2>The guardrails you set</h2>
        <ul>
          <li>
            <strong>Spend limits:</strong> per transaction and per day, so a bug cannot
            drain a wallet.
          </li>
          <li>
            <strong>Allowlists:</strong> which endpoints or recipients the agent may pay.
          </li>
          <li>
            <strong>Small, separate keys:</strong> give an agent a wallet with a little
            money, not the keys to everything.
          </li>
          <li>
            <strong>Logs:</strong> keep a record of what was paid and why.
          </li>
        </ul>

        <h2>Reality check</h2>
        <ul>
          <li>Unlimited keys lead to unlimited mistakes. Cap everything.</li>
          <li>Networks and facilitators can fail. Handle errors gracefully.</li>
          <li>Not every API supports x402 yet.</li>
          <li>Real businesses still need basic compliance and bookkeeping sense.</li>
        </ul>
        <p>
          Agents can pay. You still decide how much they are allowed to spend, and that
          is exactly how it should be.
        </p>

        <h2>See it happen</h2>
        <p>
          The clearest way to understand agent payments is to watch one. The interactive
          lab walks the whole loop, and the agent classroom shows how a machine reads the
          same instructions.
        </p>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/learn">Watch the payment loop</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/agents">Agent classroom</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/what-is-x402">What is x402?</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-subtle">
          Ship x402 is an independent educational project. Not affiliated with the x402
          Foundation, Coinbase, or the Solana Foundation. Not financial advice.
        </p>
      </Prose>
    </SiteChrome>
  );
}
