import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/x402-vs-token-gating")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.x402VsTokenGating, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.x402VsTokenGating),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          {
            name: "x402 vs token-gating",
            path: "/guides/x402-vs-token-gating",
          },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/x402-vs-token-gating">
      <Prose>
        <p className="text-sm text-subtle">Guide · Advanced · 2026</p>
        <h1>Two ways to paywall for AI agents: x402 vs on-chain token-gating</h1>
        <p>
          When people say “make agents pay,” they usually mean one of two designs.
          Mixing them up causes broken APIs and frustrated agents.
        </p>

        <h2>Option A — Server-side x402</h2>
        <p>
          The HTTP API returns <strong>402 Payment Required</strong> with price and
          network details. The client pays (often via a facilitator), retries with
          proof, and the server returns 200.
        </p>
        <ul>
          <li>Best for pay-per-request APIs and open agent traffic</li>
          <li>No need for the agent to hold a specific NFT or membership mint</li>
          <li>Price can change per route; discovery is in the 402 body</li>
          <li>Works across many clients that speak HTTP</li>
        </ul>

        <h2>Option B — On-chain token-gating</h2>
        <p>
          The server (or a gateway) checks that the caller’s wallet{" "}
          <strong>already holds</strong> a token, NFT, or subscription position, then
          allows access. Payment happened earlier — mint, buy, or stream — not inside
          this HTTP round-trip.
        </p>
        <ul>
          <li>Best for membership, clubs, and “holders only” resources</li>
          <li>Agent must already own the asset; no in-request checkout</li>
          <li>Access logic is “do you hold X?” not “pay Y now”</li>
          <li>Often paired with sign-in-with-wallet, not 402</li>
        </ul>

        <h2>Side-by-side</h2>
        <div className="not-prose overflow-x-auto rounded-[var(--radius-lg)] border border-border">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="bg-surface-2 text-fg">
              <tr>
                <th className="p-3 font-semibold"> </th>
                <th className="p-3 font-semibold">x402</th>
                <th className="p-3 font-semibold">Token-gate</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {[
                ["Payment timing", "Per request (or session in advanced schemes)", "Up front / ongoing ownership"],
                ["HTTP signal", "402 + requirements", "Usually 401/403 if missing wallet proof"],
                ["Agent UX", "Discover price → pay → retry", "Already hold token → prove wallet"],
                ["Pricing shape", "Micropayments, per route", "Membership, tier, NFT seat"],
                ["Refund / replay", "Protocol + facilitator concerns", "Token transfer / burn rules"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-border">
                  <td className="p-3 font-medium text-fg">{row[0]}</td>
                  <td className="p-3">{row[1]}</td>
                  <td className="p-3">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Can you use both?</h2>
        <p>
          Yes. Common split: token-gate a dashboard or community, and use x402 for
          metered API calls. Or sell a token that funds a prepaid balance, then drain
          with x402-style per-call charges. Keep the agent’s mental model simple: one
          request should not require three unrelated wallets.
        </p>

        <h2>Which should you ship first?</h2>
        <ul>
          <li>
            <strong>Open tools and data APIs:</strong> start with x402.
          </li>
          <li>
            <strong>Holder communities and seats:</strong> start with token-gating.
          </li>
          <li>
            <strong>Unsure:</strong> prototype x402 on Devnet in an afternoon — if agents
            only need one cheap call, 402 fits better than minting a membership.
          </li>
        </ul>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/ship">Generate x402 middleware</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/guides/agent-wallet-safely">Agent wallet safety</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/can-ai-agents-spend-money">Agents & money</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-subtle">
          Ship x402 is an independent educational project. Not financial advice.
        </p>
      </Prose>
    </SiteChrome>
  );
}
