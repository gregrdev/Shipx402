import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/ship-x402-api-solana")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.shipX402Api, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.shipX402Api),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          {
            name: "Ship an x402 API on Solana",
            path: "/guides/ship-x402-api-solana",
          },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/ship-x402-api-solana">
      <Prose>
        <p className="text-sm text-subtle">Guide · Solana · 2026</p>
        <h1>Ship an x402 API on Solana</h1>
        <p>
          This is the buyer-intent guide: how to put <strong>HTTP 402</strong> in front of
          a resource, accept payment proof, and verify or settle on Solana — including the
          Ship x402 lab path you can run today.
        </p>

        <h2>Architecture in four boxes</h2>
        <ol>
          <li>
            <strong>Resource server</strong> — your API; returns 402 or 200
          </li>
          <li>
            <strong>Client / agent</strong> — reads requirements, pays, retries
          </li>
          <li>
            <strong>Wallet</strong> — signs; keys never go to your server
          </li>
          <li>
            <strong>Optional facilitator</strong> — verifies + settles USDC so you do not
            run full chain infra
          </li>
        </ol>

        <h2>Step 1 — Unpaid request returns 402</h2>
        <p>
          For a protected route, if there is no payment header, respond with status{" "}
          <code>402</code> and a JSON body listing <code>accepts[]</code>: scheme, network,
          amount, asset, <code>payTo</code>, resource, timeout.
        </p>
        <pre>{`GET /api/premium
→ 402 Payment Required
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "solana",
    "maxAmountRequired": "...",
    "payTo": "<merchant>",
    "asset": "USDC",
    "resource": "/api/premium"
  }]
}`}</pre>

        <h2>Step 2 — Client pays</h2>
        <ul>
          <li>
            <strong>Lab / teaching</strong> — signed intent (Ship x402{" "}
            <code>exact-lab</code> scheme)
          </li>
          <li>
            <strong>Production</strong> — typically SPL USDC transfer or facilitator
            payload (see <code>x402-solana</code> / CDP docs)
          </li>
          <li>
            <strong>DIY on-chain SOL</strong> — transfer + signature proof (Ship x402 donate
            endpoint style)
          </li>
        </ul>

        <h2>Step 3 — Retry with proof</h2>
        <p>
          Same URL, header <code>X-PAYMENT</code> (or stack-specific{" "}
          <code>PAYMENT-SIGNATURE</code>) carrying base64 payment payload.
        </p>

        <h2>Step 4 — Verify, reject replays, deliver</h2>
        <ul>
          <li>Check scheme, amount, resource, signature or on-chain tx</li>
          <li>Reject reused nonces / signatures (replay protection)</li>
          <li>Return <code>200</code> + body; optional payment response header</li>
        </ul>

        <h2>Lab path on Ship x402 (no mainnet USDC)</h2>
        <ol>
          <li>
            Open <Link to="/app">/app</Link>, create a Devnet wallet
          </li>
          <li>Use the x402 Lab tab — or curl <a href="/api/x402/lab">/api/x402/lab</a></li>
          <li>Observe 402 → sign → 200; second use of same nonce is rejected</li>
        </ol>

        <h2>Production checklist</h2>
        <ul>
          <li>Dedicated RPC (not public rate-limited endpoints alone)</li>
          <li>HTTPS everywhere; CSP on the wallet UI</li>
          <li>Human/agent consent UI before any signature</li>
          <li>Idempotent settlement; durable replay store if you gate real content</li>
          <li>Clear pricing pages agents can fetch (and an <a href="/llms.txt">llms.txt</a>)</li>
        </ul>

        <h2>Related</h2>
        <ul>
          <li>
            <Link to="/guides/x402-vs-mpp">x402 vs MPP</Link>
          </li>
          <li>
            <Link to="/agents">Agent classroom</Link>
          </li>
          <li>
            <Link to="/donate">Donations as a live on-chain x402 example</Link>
          </li>
        </ul>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/app">Open lab in app</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/guides/x402-vs-mpp">Read x402 vs MPP</Link>
          </Button>
        </div>
      </Prose>
    </SiteChrome>
  );
}
