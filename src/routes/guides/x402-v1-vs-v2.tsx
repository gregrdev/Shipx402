import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/x402-v1-vs-v2")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.x402V1VsV2, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.x402V1VsV2),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          { name: "x402 v1 vs v2", path: "/guides/x402-v1-vs-v2" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/x402-v1-vs-v2">
      <Prose>
        <p className="text-sm text-subtle">Guide · Intermediate · 2026</p>
        <h1>x402 v1 vs v2: What Changed (and How to Keep Testers Working)</h1>
        <p>
          x402 V2 shipped in December 2025. V2 is the recommended baseline in 2026.
          Older tutorials still show V1 shapes. Mixing them is the fastest way to fail
          a 402 Checker or a modern client.
        </p>

        <h2>Quick comparison</h2>
        <div className="not-prose overflow-x-auto rounded-[var(--radius-lg)] border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-surface-2 text-fg">
              <tr>
                <th className="p-3 font-semibold">Aspect</th>
                <th className="p-3 font-semibold">V1</th>
                <th className="p-3 font-semibold">V2</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {[
                ["Version field", "x402Version: 1", "x402Version: 2"],
                [
                  "Payment header (client → server)",
                  "X-PAYMENT (legacy)",
                  "PAYMENT-SIGNATURE (canonical). X-PAYMENT is a V1 alias only.",
                ],
                [
                  "Requirements header (server → client)",
                  "mostly body only",
                  "PAYMENT-REQUIRED (canonical, base64 PaymentRequired). Body is optional convenience.",
                ],
                [
                  "Response header",
                  "X-PAYMENT-RESPONSE (legacy)",
                  "PAYMENT-RESPONSE (canonical). Legacy X-PAYMENT-RESPONSE is a V1 alias.",
                ],
                [
                  "Network id",
                  "strings like base-sepolia, solana-devnet",
                  "CAIP-2: eip155:84532, solana:EtWTRAB…",
                ],
                [
                  "Resource metadata",
                  "often inside each accepts[] item",
                  "top-level resource { url, description, mimeType }",
                ],
                [
                  "Amount field",
                  "maxAmountRequired",
                  "amount (+ keep maxAmountRequired for compat)",
                ],
                [
                  "Packages",
                  "x402, x402-express, …",
                  "@x402/core, @x402/express, @x402/svm, …",
                ],
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

        <h2>Solana CAIP-2 IDs you will actually use</h2>
        <ul>
          <li>
            Devnet:{" "}
            <code>solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1</code>
          </li>
          <li>
            Mainnet:{" "}
            <code>solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp</code>
          </li>
        </ul>
        <p>
          Some docs still show shorthand like <code>solana:devnet</code>. Prefer the
          genesis-hash form from current{" "}
          <a href="https://docs.x402.org" className="link-readable">
            docs.x402.org
          </a>{" "}
          and re-check before production.
        </p>

        <h2>What breaks testers</h2>
        <ul>
          <li>
            Advertising <code>solana-devnet</code> while a V2-only client expects CAIP-2.
          </li>
          <li>
            Returning 200 with no payment middleware (looks “open,” grade fails).
          </li>
          <li>
            Missing <code>payTo</code>, empty <code>accepts[]</code>, or wrong address
            format (0x on Solana).
          </li>
          <li>
            Using the public test facilitator URL on mainnet.
          </li>
          <li>
            Clients sending only <code>X-PAYMENT</code> (legacy V1) to a server that
            only reads <code>PAYMENT-SIGNATURE</code>. During migration, accept both
            — but teach and emit the V2 names first.
          </li>
        </ul>

        <h2>Compat recipe used on this site</h2>
        <p>
          Our lab and donate endpoints advertise <strong>v2 envelopes</strong> and still
          mirror useful v1 fields:
        </p>
        <ul>
          <li>
            Top-level <code>resource</code> + <code>x402Version: 2</code>
          </li>
          <li>
            <code>amount</code> and legacy <code>maxAmountRequired</code>
          </li>
          <li>CAIP-2 <code>network</code> in accepts</li>
          <li>
          <li>
            Accept inbound proofs on <code>PAYMENT-SIGNATURE</code> first; keep{" "}
            <code>X-PAYMENT</code> as a legacy alias
          </li>
          </li>
        </ul>
        <p>
          That way humans, older scripts, and current agents can all complete the loop.
        </p>

        <h2>Migration checklist</h2>
        <ol>
          <li>Bump packages to <code>@x402/*</code> v2 line.</li>
          <li>
            Switch middleware to routes-config + <code>x402ResourceServer</code> + scheme
            register (ExactSvmScheme / ExactEvmScheme).
          </li>
          <li>Replace network strings with CAIP-2.</li>
          <li>Add PAYMENT-* headers as the default; keep X-* only as a documented legacy alias.</li>
          <li>
            Validate with{" "}
            <Link to="/check" className="link-readable">
              the 402 Checker
            </Link>{" "}
            and a known-good endpoint like this site’s donate route.
          </li>
        </ol>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/ship">Generate v2 middleware</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/check">Run 402 Checker</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/ship-x402-api-solana">Ship on Solana</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-subtle">
          Always re-check{" "}
          <a href="https://docs.x402.org" className="link-readable">
            docs.x402.org
          </a>{" "}
          before production — package APIs evolve. Ship x402 is independent and not
          financial advice.
        </p>
      </Prose>
    </SiteChrome>
  );
}
