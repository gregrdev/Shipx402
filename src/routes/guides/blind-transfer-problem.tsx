import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/blind-transfer-problem")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.blindTransfer, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.blindTransfer),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          {
            name: "Blind transfer problem",
            path: "/guides/blind-transfer-problem",
          },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/blind-transfer-problem">
      <Prose>
        <p className="text-sm text-subtle">Guide · Intermediate · 2026</p>
        <h1>When an agent wants to pay you but you have no 402</h1>
        <p>
          Someone (or some agent) is ready to send money. You have a wallet address.
          You do <strong>not</strong> have a paid endpoint that returns HTTP 402 with
          machine-readable requirements. That is the{" "}
          <strong>blind transfer problem</strong>.
        </p>

        <h2>What “blind” means</h2>
        <p>
          A transfer is blind when the payer cannot programmatically answer:
        </p>
        <ul>
          <li>How much is enough?</li>
          <li>Which asset and network?</li>
          <li>What resource unlocks after payment?</li>
          <li>How do I prove I paid so the server grants access?</li>
          <li>Can this proof be reused forever?</li>
        </ul>
        <p>
          Humans paper over this with chats (“send 0.01 SOL and I’ll unlock it”). Agents
          cannot safely guess. They either overpay, underpay, pay the wrong chain, or
          refuse.
        </p>

        <h2>A live tip that almost worked</h2>
        <p>
          Picture an agent that wants to tip a tutorial site. It finds a public address
          in a footer. It can send SOL. It cannot know:
        </p>
        <ul>
          <li>whether the site will notice the transfer,</li>
          <li>whether a minimum amount exists,</li>
          <li>or how to get a receipt for its logs.</li>
        </ul>
        <p>
          That is why educational projects that want agent tips expose a real{" "}
          <code>/api/x402/…</code> endpoint: the 402 body is the contract; the retry with
          proof is the handshake; the receipt is the audit trail.
        </p>

        <h2>Why x402 exists (in this light)</h2>
        <p>
          x402 turns “please pay me somehow” into a standard web response:
        </p>
        <p>
          <code>Request → 402 + accepts[] → pay → retry with proof → 200</code>
        </p>
        <p>
          The server publishes the price. The client does not invent a transfer memo and
          hope. Replay protection stops one payment from unlocking forever.
        </p>

        <h2>What to do if you only have an address today</h2>
        <ol>
          <li>
            Publish a clear human page: network, asset, minimum, what the tip supports.
          </li>
          <li>
            Prefer Solana Pay QR / links for humans (amount + label + reference).
          </li>
          <li>
            For agents, add even a minimal x402 endpoint (this site’s donate flow is the
            pattern: on-chain verify + single-use proof).
          </li>
          <li>
            Log receipts. Agents and bookkeeping both need them.
          </li>
        </ol>

        <h2>Anti-patterns</h2>
        <ul>
          <li>Posting a seed phrase or private key so an agent can “just pay.”</li>
          <li>Accepting any transfer of any size with no verification path.</li>
          <li>Unlocking content forever from one screenshot of a tx id.</li>
        </ul>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/donate">See human + agent donate paths</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/guides/what-is-x402">What is x402?</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/can-ai-agents-spend-money">Agents spending money</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-subtle">
          Ship x402 is an independent educational project. Not financial advice.
        </p>
      </Prose>
    </SiteChrome>
  );
}
