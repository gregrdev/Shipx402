import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/http-402-history")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.http402History, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.http402History),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          { name: "HTTP 402 history", path: "/guides/http-402-history" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/http-402-history">
      <Prose>
        <p className="text-sm text-subtle">Guide · Story · 2026</p>
        <h1>HTTP 402: thirty years dormant, now the agent payment layer</h1>
        <p>
          The web always had a status code for “Payment Required.” For most of its
          life, almost nobody used it for real. Then machines started buying API calls
          by themselves — and 402 finally had a job.
        </p>

        <h2>What 402 always meant</h2>
        <p>
          In the HTTP status registry, <strong>402 Payment Required</strong> sat
          reserved for future digital payment schemes. Browsers did not standardize a
          checkout UI around it. Sites invented accounts, cookies, and API keys instead.
        </p>

        <h2>Why it woke up</h2>
        <ul>
          <li>Stablecoins made “one cent” a real unit without card fees eating it.</li>
          <li>Fast chains made settlement feel like normal web latency.</li>
          <li>
            Agents needed programmatic pay-per-request without a human on a billing page.
          </li>
        </ul>
        <p>
          Coinbase launched the x402 protocol in 2025 to define what a 402 response
          should contain and how clients retry with proof. In 2026 governance sits with
          the x402 Foundation under the Linux Foundation, with a broad industry
          membership.
        </p>

        <h2>What changed with the protocol (not just the code)</h2>
        <p>
          Status 402 alone is not enough. x402 adds the machine contract: accepted
          networks (CAIP-2), amounts, schemes, optional facilitators, and headers for
          requirements and signatures. V2 cleaned that envelope further for multi-chain
          and modern clients.
        </p>

        <h2>Why builders should care</h2>
        <p>
          You can still sell subscriptions. You can still use Stripe. x402 is for the
          long tail of tiny, bursty, agent-shaped demand — the calls that never justified
          a sales call or a monthly plan.
        </p>

        <h2>Try the modern 402</h2>
        <p>
          On this site the lab returns a real 402 with a v2-shaped body. The donate
          endpoint does the same with on-chain verification. That is the status code
          earning its keep.
        </p>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/learn">Learn the payment loop</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/guides/what-is-x402">What Is x402?</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/x402-v1-vs-v2">v1 vs v2</Link>
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
