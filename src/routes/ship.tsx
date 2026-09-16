import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/site-chrome";
import { SupportNudge } from "@/components/support-nudge";
import { ShipGenerator } from "@/components/ship-generator";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ship")({
  component: ShipPage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.ship, {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Ship", path: "/ship" },
        ]),
      ],
    }),
});

function ShipPage() {
  return (
    <SiteChrome activePath="/ship">
      <div className="space-y-8 animate-fade-up">
        <header className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
            Tools
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {SEO_PAGES.ship.h1}
          </h1>
          <p className="text-lg text-muted">
            Pure client-side templating for Express, Next.js, or Hono. Pick network and
            price, paste payTo, copy install + middleware. Nothing you type leaves the
            browser.
          </p>
          <p className="text-sm text-muted">
            Devnet is the practice chain with free test SOL — no real money. A
            facilitator verifies and settles 402 payments (not the RPC, not the paywall).
          </p>
          <Button asChild variant="secondary" size="sm">
            <Link to="/check">Have a URL? Run 402 Checker →</Link>
          </Button>
        </header>
        <ShipGenerator />
      </div>
        <SupportNudge className="mt-10" />
    </SiteChrome>
  );
}
