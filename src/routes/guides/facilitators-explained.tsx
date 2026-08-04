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
          { name: "Facilitators explained", path: "/guides/facilitators-explained" },
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
        <ul>
          <li>
            <strong>The free test facilitator:</strong> the public one at
            {" "}
            <code>x402.org/facilitator</code> is the easiest way to develop on testnets
            like Solana Devnet and Base Sepolia. Use it while you build, not for real
            money.
          </li>
          <li>
            <strong>Coinbase CDP:</strong> a production path with polished docs and a
            free tier that needs a CDP account. A common default when you go live.
          </li>
          <li>
            <strong>PayAI:</strong> a public facilitator popular for Solana production
            traffic.
          </li>
          <li>
            <strong>Self-hosted:</strong> run your own for full control. That also means
            full responsibility for uptime, security, and keeping current with the spec.
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
          Use the free test facilitator on Devnet while you learn the loop. When you are
          ready for real payments, start with a hosted production facilitator like CDP or
          PayAI, and only consider self-hosting once you have a clear reason and the time
          to maintain it. Always confirm the current setup against the official docs
          before production, since these services evolve.
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
