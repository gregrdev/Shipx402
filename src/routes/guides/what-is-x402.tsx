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
          { name: "What is x402", path: "/guides/what-is-x402" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/what-is-x402">
      <Prose>
        <p className="text-sm text-subtle">Guide · Plain English · 2026</p>
        <h1>What is x402?</h1>
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
          <li>The server replies: “This costs money,” and includes the price and where to pay.</li>
          <li>You pay from a crypto wallet (often a stablecoin like USDC).</li>
          <li>You ask again, this time with proof of payment.</li>
          <li>The server unlocks the response.</li>
        </ol>
        <p>
          Think of it like a vending machine on the internet. Request, pay, receive.
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
          <li>Not free (you still pay small network fees)</li>
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
          Start with the interactive lessons, practice a wallet on Devnet, then ship
          middleware when you are ready.
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
