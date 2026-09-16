import { createFileRoute, Link } from "@tanstack/react-router";
import { Route as RouteIcon } from "lucide-react";
import { SiteChrome } from "@/components/site-chrome";
import { PaymentLoop } from "@/components/payment-loop";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/loop")({
  component: LoopPage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.loop, {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Payment loop", path: "/loop" },
        ]),
      ],
    }),
});

function LoopPage() {
  return (
    <SiteChrome activePath="/loop">
      <div className="space-y-8 animate-fade-up">
        <header className="max-w-2xl space-y-3">
          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-primary">
            <RouteIcon className="size-3.5" />
            Walkthrough
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {SEO_PAGES.loop.h1}
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            {SEO_PAGES.loop.description}
          </p>
          <p className="text-sm text-muted">
            Practice on Devnet — free test SOL, no real money. Mainnet is real funds;
            only with explicit human consent.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild variant="secondary" size="sm">
              <Link to="/learn">Learn hub</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/app">Practice wallet</Link>
            </Button>
          </div>
        </header>

        <PaymentLoop />
      </div>
    </SiteChrome>
  );
}
