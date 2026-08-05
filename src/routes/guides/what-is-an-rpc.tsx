import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/what-is-an-rpc")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.whatIsAnRpc, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.whatIsAnRpc),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          { name: "What is an RPC", path: "/guides/what-is-an-rpc" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/what-is-an-rpc">
      <Prose>
        <p className="text-sm text-subtle">Guide · Beginner · 2026</p>
        <h1>What is an RPC, and why your x402 endpoint needs one</h1>
        <p>
          People often mix up three different pieces: the <strong>x402 paywall</strong>,
          the <strong>facilitator</strong>, and the <strong>RPC</strong>. This guide
          separates them so you stop pasting Helius (or any RPC) into the wrong field.
        </p>

        <h2>RPC in one sentence</h2>
        <p>
          An <strong>RPC</strong> (Remote Procedure Call endpoint) is how software{" "}
          <em>reads and writes the blockchain</em>. Your app asks: “What is this
          wallet’s balance?” or “Has this transaction landed?” The RPC answers.
        </p>
        <p>
          It is a blockchain <strong>reader/writer</strong>, not a payment protocol and
          not a paywall.
        </p>

        <h2>What an RPC is not</h2>
        <ul>
          <li>
            <strong>Not the x402 402 response.</strong> Returning HTTP 402 with a price
            is your API middleware.
          </li>
          <li>
            <strong>Not the facilitator.</strong> Facilitators verify and settle
            payments so you do not reimplement chain ops for every seller.
          </li>
          <li>
            <strong>Not a wallet.</strong> Wallets hold keys. RPCs talk to the network.
          </li>
        </ul>

        <h2>Where RPC shows up in x402</h2>
        <ol>
          <li>
            <strong>Buyer side:</strong> building or confirming a transfer may need
            chain state (blockhash, balances).
          </li>
          <li>
            <strong>Seller side:</strong> if you verify on-chain yourself (like this
            site’s donation endpoint), you call{" "}
            <code>getParsedTransaction</code> (or similar) through an RPC.
          </li>
          <li>
            <strong>Facilitator side:</strong> hosted facilitators use their own RPCs
            behind the scenes so many sellers never configure one.
          </li>
        </ol>

        <h2>Public vs dedicated RPC</h2>
        <ul>
          <li>
            <strong>Public cluster URLs</strong> (for example Solana’s free endpoints)
            are fine for demos and light traffic. They rate-limit and can flake.
          </li>
          <li>
            <strong>Dedicated providers</strong> (Helius, Triton, QuickNode, and others)
            give higher limits and reliability for production verification.
          </li>
        </ul>
        <p>
          If your donation or settlement path fails with “transaction not found” under
          load, the first thing to check is RPC quality — not your x402{" "}
          <code>accepts[]</code> shape.
        </p>

        <h2>Simple mental model</h2>
        <ul>
          <li>
            <strong>x402</strong> = how the web request says “pay, then retry.”
          </li>
          <li>
            <strong>Facilitator</strong> = optional helper that verifies/settles for you.
          </li>
          <li>
            <strong>RPC</strong> = the pipe to the blockchain when someone actually
            reads or writes chain state.
          </li>
        </ul>

        <h2>What to put where</h2>
        <ul>
          <li>
            Env for your server’s own verification:{" "}
            <code>SOLANA_RPC_URL=https://…</code>
          </li>
          <li>
            Env for paywall config: <code>X402_PAY_TO</code>,{" "}
            <code>X402_FACILITATOR_URL</code>, network CAIP-2 id.
          </li>
          <li>
            Never put a private key in RPC config. RPC URLs are usually public
            endpoints with API keys for rate limits — still keep keys out of the browser.
          </li>
        </ul>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/guides/facilitators-explained">Facilitators explained</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/guides/ship-x402-api-solana">Ship an x402 API</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/learn">Back to learning path</Link>
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
