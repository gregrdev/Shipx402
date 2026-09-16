import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/facilitators-explained")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.facilitatorsExplained, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.facilitatorsExplained),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          { name: "Facilitators Explained", path: "/guides/facilitators-explained" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/facilitators-explained">
      <Prose>
        <p className="text-sm text-subtle">Guide · Developers · 2026</p>
        <h1>Facilitators, explained simply</h1>
        <p>
          When you read about x402, the word "facilitator" shows up a lot and rarely gets
          explained. Here is the plain version.
        </p>

        <h2>What a facilitator does</h2>
        <p>
          A facilitator is a helper service that verifies and settles payments, so every
          API does not have to run full blockchain operations on its own. Instead of your
          server tracking chains, tokens, and signatures by hand, it hands the heavy part
          to a facilitator and gets back a simple yes or no.
        </p>
        <p>
          Two things worth knowing. First, the buyer still signs the payment themselves,
          so the facilitator is verifying, not taking over the wallet. Second, a good
          facilitator does not need to hold user funds to do its job. It checks and
          settles; it is not a bank in the middle.
        </p>

        <h2>The common options</h2>
        <p>
          Anyone can run a facilitator. Official selected production options live on{" "}
          <a href="https://docs.x402.org/dev-tools/facilitators" className="link-readable">
            docs.x402.org/dev-tools/facilitators
          </a>
          . That list is not exhaustive and changes; re-check it before you ship.
        </p>
        <ul>
          <li>
            <strong>x402.org test facilitator:</strong>{" "}
            <code>https://x402.org/facilitator</code> — the default in the official
            packages. Easiest way to develop on Solana Devnet (
            <code>solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1</code>
            ) (and other testnets the public facilitator lists, such as Base Sepolia{" "}
            <code>eip155:84532</code>). Prefer Solana Devnet here. Use it while you
            build, not for real money.
          </li>
          <li>
            <strong>Coinbase CDP Facilitator:</strong> hosted production path with
            KYT/OFAC checks. Solana support is scheme <code>exact</code> only (USDC and
            other SPL tokens). Facilitator base URL:{" "}
            <code>https://api.cdp.coinbase.com/platform/v2/x402</code> — confirm in
            current CDP docs before production. See{" "}
            <a href="https://docs.cdp.coinbase.com/x402/network-support" className="link-readable">
              CDP network support
            </a>
            .
          </li>
          <li>
            <strong>PayAI Facilitator:</strong> a public facilitator popular for Solana
            production traffic. Facilitator base URL:{" "}
            <a href="https://facilitator.payai.network" className="link-readable">
              https://facilitator.payai.network
            </a>{" "}
            — confirm in current PayAI docs before production.
          </li>
          <li>
            <strong>Others on the official list</strong> (examples: Corbits, Dexter,
            Solvador) plus <strong>self-hosted / self-facilitate</strong> if you need
            full control. Do not treat a blog post as the catalog — use the docs page.
          </li>
        </ul>

        <h2>How to choose</h2>
        <p>Pick based on a few practical questions, not hype:</p>
        <ul>
          <li>
            <strong>Chain support:</strong> does it settle on the network you actually
            use?
          </li>
          <li>
            <strong>Uptime:</strong> a payment layer that goes down takes your paid API
            with it.
          </li>
          <li>
            <strong>Cost and limits:</strong> free tiers are great to start; check the
            ceilings before you scale.
          </li>
          <li>
            <strong>Effort:</strong> a hosted facilitator is less work; self-hosting is
            more control and more maintenance.
          </li>
        </ul>

        <h2>A simple starting rule</h2>
        <p>
          Use the x402.org test facilitator on Devnet while you learn the loop. When you
          are ready for real payments, pick a production facilitator from the official
          list that supports your network (CDP and PayAI are common Solana choices), and
          only consider self-hosting once you have a clear reason. Always confirm the
          current setup against{" "}
          <a href="https://docs.x402.org" className="link-readable">
            docs.x402.org
          </a>{" "}
          before production.
        </p>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/guides/ship-x402-api-solana">Build an x402 API on Solana</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/ship">Generate starter code</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/test-x402-endpoint">Test your endpoint</Link>
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
