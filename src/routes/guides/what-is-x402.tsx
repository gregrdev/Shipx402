import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/what-is-x402")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.whatIsX402, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.whatIsX402),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          { name: "What Is x402", path: "/guides/what-is-x402" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/what-is-x402">
      <Prose>
        <p className="text-sm text-subtle">Guide · Plain English · 2026</p>
        <h1>{SEO_PAGES.whatIsX402.h1}</h1>
        <p>
          <strong>x402 is a simple idea:</strong> a website or API can charge a small
          payment before it gives you the data.
        </p>
        <p>That is it.</p>

        <h2>The problem it solves</h2>
        <p>
          Most paid APIs force you into accounts, API keys, monthly plans, or checkout
          pages. That works for humans. It is awkward for software, especially AI agents
          that may only need one cheap request.
        </p>
        <p>
          x402 uses an old HTTP status code, <strong>402 Payment Required</strong>, to
          handle that in a normal web request.
        </p>

        <h2>How it works</h2>
        <ol>
          <li>You ask for something (an API call).</li>
          <li>
            The server replies HTTP <strong>402</strong> with{" "}
            <code>PAYMENT-REQUIRED</code> — the canonical V2 header that carries the
            price, network (
            <Link to="/guides/x402-v1-vs-v2" className="link-readable">
              CAIP-2
            </Link>{" "}
            — standard network id, genesis-hash form), asset, and payTo (the wallet
            address that receives the payment). A JSON body is a convenience;
            official docs treat the header as the wire location.
          </li>
          <li>
            You pay from a crypto wallet (on Solana — the chain we teach first for these
            payments — typically USDC with scheme <code>exact</code>).
          </li>
          <li>
            You ask again with <code>PAYMENT-SIGNATURE</code> (the V2 retry header).
            Older tutorials show <code>X-PAYMENT</code> — that is the legacy V1 name.
          </li>
          <li>
            The server unlocks the response and may send{" "}
            <code>PAYMENT-RESPONSE</code> with settlement details.
          </li>
        </ol>
        <p>
          Think of it like a vending machine on the internet. Request, pay, receive.
          See{" "}
          <a href="https://docs.x402.org/core-concepts/http-402" className="link-readable">
            docs.x402.org — HTTP 402
          </a>
          .
        </p>

        <h2>Why it matters now</h2>
        <p>Three things finally lined up:</p>
        <ul>
          <li>Stablecoins that stay near one dollar</li>
          <li>Blockchains fast and cheap enough for tiny payments</li>
          <li>Software agents that can pay without a human clicking “Buy” every time</li>
        </ul>
        <p>
          Coinbase launched x402 in 2025. Governance later moved to an open group, the
          x402 Foundation under the Linux Foundation, so it is not only a single-company
          product.
        </p>

        <h2>What x402 is not</h2>
        <ul>
          <li>Not a credit card processor</li>
          <li>Not a replacement for every subscription</li>
          <li>
            Not free of chain costs (x402 is the protocol; the chain still charges small
            network fees)
          </li>
          <li>Not only for crypto experts</li>
        </ul>

        <h2>Who it is for</h2>
        <ul>
          <li>Developers who want pay-per-request pricing</li>
          <li>People building tools AI agents can use</li>
          <li>Anyone tired of billing systems for one-cent calls</li>
        </ul>

        <h2>Try it here</h2>
        <p>
          Start with the interactive lessons, practice a wallet on Devnet{" "}
          <a
            href="https://www.shipx402.com/guides/first-solana-wallet"
            className="chip mx-1 inline-flex border border-border bg-bg px-2 py-0.5 text-xs font-medium text-muted no-underline hover:text-fg"
          >
            Devnet · practice network · free test money
          </a>
          , then ship middleware when you are ready.
        </p>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/learn">Learn the payment loop</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/app">Practice wallet</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/x402-vs-mpp">x402 vs MPP</Link>
          </Button>
        </div>
      </Prose>
    </SiteChrome>
  );
}
