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
        <h1>How to build an x402-paid API on Solana</h1>
        <p>
          This is the seller path: your API stays locked until payment clears, then
          returns the data. Always re-check{" "}
          <a href="https://docs.x402.org" className="link-readable">
            docs.x402.org
          </a>{" "}
          before production. Package APIs can change.
        </p>

        <h2>The flow</h2>
        <ol>
          <li>Client hits your route.</li>
          <li>
            You return <strong>HTTP 402</strong> with{" "}
            <code>PAYMENT-REQUIRED</code> (canonical V2 header).
          </li>
          <li>Client pays on Solana.</li>
          <li>
            Client retries with <code>PAYMENT-SIGNATURE</code> (legacy alias:{" "}
            <code>X-PAYMENT</code>).
          </li>
          <li>
            You verify and return <strong>200</strong> plus{" "}
            <code>PAYMENT-RESPONSE</code>.
          </li>
        </ol>

        <h2>Step 1: Get a receiving wallet</h2>
        <p>
          Create a Solana wallet. Put only the <strong>public address</strong> on your
          server. Never put a private key in your API.
        </p>
        <p>Practice on <strong>devnet</strong> first. Devnet money is fake on purpose.</p>
        <ul>
          <li>
            Devnet network ID:{" "}
            <code>solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1</code>
          </li>
          <li>
            Mainnet network ID:{" "}
            <code>solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp</code>
          </li>
        </ul>
        <p>
          Production Solana x402 uses scheme <code>exact</code> (not{" "}
          <code>upto</code> or <code>batch-settlement</code> — those are EVM). Default
          dollar-string USDC mints from{" "}
          <a
            href="https://docs.x402.org/core-concepts/network-and-token-support"
            className="link-readable"
          >
            docs.x402.org
          </a>
          :
        </p>
        <ul>
          <li>
            Mainnet USDC: <code>EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code> (6
            decimals)
          </li>
          <li>
            Devnet USDC: <code>4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU</code> (6
            decimals)
          </li>
        </ul>

        <h2>Step 2: Install packages</h2>
        <pre>{`npm install @x402/express @x402/core @x402/svm`}</pre>
        <p>
          Use <code>@x402/hono</code> or <code>@x402/next</code> if that is your
          framework.
        </p>

        <h2>Step 3: Protect a route (v2 shape)</h2>
        <p>
          Current docs use a routes-first config and an{" "}
          <code>x402ResourceServer</code>, not the old payTo-first signature.
        </p>
        <pre>{`import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";

const app = express();
const payTo = process.env.X402_PAY_TO!; // Solana address

const facilitator = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator", // testnet only
});

app.use(
  paymentMiddleware(
    {
      "GET /api/premium": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
            payTo,
          },
        ],
        description: "Premium data",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(facilitator).register(
      "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      new ExactSvmScheme(),
    ),
  ),
);

app.get("/api/premium", (_req, res) => {
  res.json({ ok: true, message: "Paid access granted" });
});

app.listen(3000);`}</pre>

        <h2>Step 4: Test the 402</h2>
        <pre>{`curl -i http://localhost:3000/api/premium`}</pre>
        <p>
          You should see status <strong>402</strong>, not 200. When the endpoint is
          public, paste it into the{" "}
          <Link to="/check" className="link-readable">
            402 Checker
          </Link>
          .
        </p>

        <h2>Step 5: Go live carefully</h2>
        <ol>
          <li>Switch to the mainnet network ID.</li>
          <li>
            Switch to a production facilitator (for example Coinbase CDP or PayAI at{" "}
            <code>https://facilitator.payai.network</code>).
          </li>
          <li>Use your real receiving address.</li>
          <li>Test with a tiny amount first.</li>
        </ol>
        <p>
          The public test facilitator (<code>https://x402.org/facilitator</code>) is for
          testnets only. Do not point mainnet traffic at it.
        </p>

        <h2>Common mistakes</h2>
        <ul>
          <li>Using the test facilitator on mainnet</li>
          <li>
            Putting an Ethereum-style <code>0x</code> address in a Solana field
          </li>
          <li>Forgetting to register the Solana payment scheme</li>
          <li>Leaving the route unprotected by accident</li>
        </ul>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/ship">Open Ship generator</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/check">Run 402 Checker</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/learn">Learn the loop first</Link>
          </Button>
        </div>
      </Prose>
    </SiteChrome>
  );
}
