import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/agent-readable")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.agentReadable, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.agentReadable),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          { name: "Agent-readable", path: "/guides/agent-readable" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/agent-readable">
      <Prose>
        <p className="text-sm text-subtle">Guide · Advanced · 2026</p>
        <h1>Why “agent-readable” matters</h1>
        <p>
          Humans follow nav bars and marketing pages. Agents follow structured files,
          stable URLs, and honest error codes. If you want agents to learn from your
          site — or pay you — design for both.
        </p>

        <h2>The surfaces that matter</h2>
        <ul>
          <li>
            <strong>
              <a href="/llms.txt" className="link-readable">
                /llms.txt
              </a>
            </strong>{" "}
            — short map of what the site is and which URLs matter.
          </li>
          <li>
            <strong>
              <a href="/api/agents/curriculum" className="link-readable">
                /api/agents/curriculum
              </a>
            </strong>{" "}
            — step-by-step process JSON with safety rules.
          </li>
          <li>
            <strong>
              <code>/.well-known/agent-card.json</code>
            </strong>{" "}
            (and <code>agent.json</code>) — discovery documents agents already probe.
          </li>
          <li>
            <strong>
              <code>/.well-known/x402</code>
            </strong>{" "}
            — list payable resources for x402-aware crawlers.
          </li>
          <li>
            <strong>Live 402 endpoints</strong> — e.g. lab and donate — so agents can
            practice or tip without scraping prose.
          </li>
        </ul>

        <h2>Design principles</h2>
        <ol>
          <li>
            <strong>Stable paths.</strong> Do not rename curriculum URLs weekly.
          </li>
          <li>
            <strong>JSON that matches the docs.</strong> If you say “five steps,” the
            array has five objects.
          </li>
          <li>
            <strong>Safety first.</strong> Explicitly tell agents never to store user
            private keys.
          </li>
          <li>
            <strong>Clean 404s.</strong> Unknown discovery paths should not 500.
          </li>
          <li>
            <strong>Real 402s.</strong> Payable routes return machine-readable
            requirements, not HTML error pages.
          </li>
        </ol>

        <h2>What Ship x402 ships</h2>
        <p>
          This project is intentionally dual-interface: humans get guides and a
          practice wallet; agents get curriculum, llms.txt, well-known cards, and live
          x402 endpoints. That is the product — not a bolt-on afterthought.
        </p>

        <h2>Copy this pattern for your API</h2>
        <ol>
          <li>Write one page a human can finish in ten minutes.</li>
          <li>Expose the same steps as JSON.</li>
          <li>Add llms.txt linking both.</li>
          <li>If you charge, return a real 402 on the paid route.</li>
          <li>Publish a minimal agent-card that points at those URLs.</li>
        </ol>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/agents">Agent classroom</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="/llms.txt">Open llms.txt</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/.well-known/agent-card.json">agent-card.json</a>
          </Button>
        </div>

        <p className="mt-8 text-sm text-subtle">
          Ship x402 is an independent educational project. Not financial advice.
        </p>
      </Prose>
    </SiteChrome>
  );
}
