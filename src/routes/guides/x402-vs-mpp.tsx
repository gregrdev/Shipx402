import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/x402-vs-mpp")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.x402VsMpp, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.x402VsMpp),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          { name: "x402 vs MPP", path: "/guides/x402-vs-mpp" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/x402-vs-mpp">
      <Prose>
        <p className="text-sm text-subtle">Guide · Updated 2026</p>
        <h1>x402 vs MPP: HTTP micropayments compared</h1>
        <p>
          Two ideas keep showing up in agent commerce: <strong>x402</strong> (pay for an
          HTTP resource with a 402 challenge) and <strong>MPP-style</strong> models
          (micropayment / prepaid channel patterns for streaming or session value). This
          guide is the practical comparison — not a standards-body document.
        </p>

        <h2>One-line difference</h2>
        <ul>
          <li>
            <strong>x402</strong> — resource-scoped: “this request costs X; pay then
            retry.” Great for APIs, articles, tool calls.
          </li>
          <li>
            <strong>MPP-style channels</strong> — session-scoped: open a balance or
            channel, meter usage, settle periodically. Great for streams, long agent
            sessions, chat tokens.
          </li>
        </ul>

        <h2>Side-by-side</h2>
        <div className="not-prose overflow-x-auto rounded-[var(--radius-lg)] border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-surface-2 text-fg">
              <tr>
                <th className="p-3 font-semibold">Dimension</th>
                <th className="p-3 font-semibold">x402</th>
                <th className="p-3 font-semibold">MPP-style</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {[
                ["HTTP signal", "402 + machine price tag", "Often 200 with balance headers / side channel"],
                ["Unit of pay", "Per request / resource", "Per session, second, or token"],
                ["Discovery", "GET unpaid → accepts[]", "Open channel / quote endpoint"],
                ["Agent fit", "Excellent for tool calls", "Excellent for long-running agents"],
                ["Solana fit", "USDC transfer / facilitator or on-chain proof", "Channels / streaming settle designs"],
                ["UX for humans", "One-shot paywall feel", "Tab-open prepaid feel"],
                ["Failure mode", "Retry with new proof / nonce", "Top up channel"],
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

        <h2>When to choose x402</h2>
        <ul>
          <li>APIs where each call has a clear price</li>
          <li>You want standard HTTP semantics agents already understand</li>
          <li>Facilitators (e.g. CDP, public Solana facilitators) can settle USDC</li>
          <li>You are okay with “challenge → pay → retry” latency per resource</li>
        </ul>

        <h2>When MPP-style fits better</h2>
        <ul>
          <li>Streaming responses or many tiny increments per second</li>
          <li>You want one authorization for a whole agent session</li>
          <li>Metering logic is continuous rather than resource-keyed</li>
        </ul>

        <h2>Can you use both?</h2>
        <p>
          Yes. Common pattern: <strong>x402 to open or top up</strong> a session balance,
          then meter inside the session with MPP-like accounting. Ship x402 focuses on the
          x402 leg because it is the clearest on-ramp for Solana + agents today.
        </p>

        <h2>Try it here</h2>
        <p>
          Educational loop (no real USDC): <a href="/api/x402/lab">/api/x402/lab</a> or the
          lab tab in <Link to="/app">/app</Link>. Builder guide:{" "}
          <Link to="/guides/ship-x402-api-solana">Ship an x402 API on Solana</Link>.
        </p>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/guides/ship-x402-api-solana">Next: ship an API</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/learn">Learn hub</Link>
          </Button>
        </div>
      </Prose>
    </SiteChrome>
  );
}
