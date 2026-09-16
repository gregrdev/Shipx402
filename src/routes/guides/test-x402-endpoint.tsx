import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/test-x402-endpoint")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.testX402Endpoint, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.testX402Endpoint),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          { name: "Test an x402 Endpoint", path: "/guides/test-x402-endpoint" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/test-x402-endpoint">
      <Prose>
        <p className="text-sm text-subtle">Guide · Developers · 2026</p>
        <h1>How to Test an x402 Endpoint</h1>
        <p>
          If your paid API is broken, the 402 response usually tells you why. The trick
          is knowing how to read it. Here is a quick way to test an endpoint and spot the
          common problems.
        </p>

        <h2>The basic test</h2>
        <p>Send a plain request with no payment and look at what comes back:</p>
        <pre className="not-prose overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-sm">
          <code>curl -i https://your-api.example/api/premium</code>
        </pre>
        <p>
          Read headers first, then the body. Headers carry the machine contract; the body
          should match.
        </p>
        <p>A healthy unpaid 402 answers with:</p>
        <ul>
          <li>Status <strong>402</strong>, not 200</li>
          <li>
            Header <code>PAYMENT-REQUIRED</code> — base64 JSON PaymentRequired
            (canonical wire location per{" "}
            <a href="https://docs.x402.org/core-concepts/http-402" className="link-readable">
              docs.x402.org
            </a>
            )
          </li>
          <li>
            Readable payment details (often also in the JSON body): amount, CAIP-2{" "}
            <code>network</code>, <code>asset</code>, <code>payTo</code>,{" "}
            <code>scheme</code>
          </li>
          <li>
            Production Solana: <code>scheme: "exact"</code> and USDC mint{" "}
            <code>EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code> (6 decimals)
          </li>
        </ul>

        <h2>How to read the response</h2>
        <p>When it is not 402, the status code is a clue:</p>
        <ul>
          <li>
            <strong>200:</strong> the payment middleware is not applied. The route is
            open to everyone.
          </li>
          <li>
            <strong>401 or 403:</strong> auth blocked the request before payment ran.
            Check your middleware order.
          </li>
          <li>
            <strong>404:</strong> wrong URL. The route does not exist where you think.
          </li>
          <li>
            <strong>402 with an empty or partial body:</strong> the setup is incomplete.
            The challenge is missing required fields.
          </li>
          <li>
            <strong>Wrong address format:</strong> a wallet or chain is misconfigured,
            for example an Ethereum-style <code>0x</code> address in a Solana field.
          </li>
        </ul>

        <h2>Use the 402 Checker</h2>
        <p>
          Reading the raw response by hand gets old fast. Paste your public HTTPS URL
          into the <Link to="/check">402 Checker</Link>. It fetches the endpoint once and
          grades the shape of the 402, so you can see exactly which fields are missing or
          wrong. Want a known-good example to compare against? This site's own donate
          endpoint at <code>/api/x402/donate</code> is a live 402 you can run through it.
        </p>

        <h2>After a real payment</h2>
        <p>
          Once payment works, test the retry on the same URL. A healthy after-pay
          response looks like this:
        </p>
        <ul>
          <li>
            Client retry header <code>PAYMENT-SIGNATURE</code> (canonical V2; legacy
            name <code>X-PAYMENT</code>)
          </li>
          <li>
            Status <strong>200</strong> with the resource
          </li>
          <li>
            Typically a <code>PAYMENT-RESPONSE</code> settlement header
          </li>
          <li>
            Reusing the same proof a second time should be rejected if replay
            protection is working — that check stops one payment from unlocking a
            resource forever
          </li>
        </ul>

        <h2>Test on Devnet first</h2>
        <p>
          Do all of this on Devnet until the path is boring and predictable. Then switch
          the Mainnet settings on purpose, one at a time, rather than discovering a
          misconfiguration with real money on the line.
        </p>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/check">Open the 402 Checker</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/guides/ship-x402-api-solana">Build an x402 API on Solana</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/ship">Generate starter code</Link>
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
