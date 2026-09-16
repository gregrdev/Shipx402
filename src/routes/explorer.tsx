import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/site-chrome";
import { WalletLookupPanel } from "@/components/wallet-lookup-panel";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/explorer")({
  component: ExplorerPage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.explorer, {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Balance explorer", path: "/explorer" },
        ]),
      ],
    }),
});

function ExplorerPage() {
  return (
    <SiteChrome activePath="/explorer">
      <div className="space-y-8 animate-fade-up">
        <header className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
            Tools
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {SEO_PAGES.explorer.h1}
          </h1>
          <p className="text-lg text-muted">
            This is a <strong>read-only Solana wallet lookup</strong> (public address →
            SOL balance, rough USD, recent transactions via RPC). It is not an x402
            facilitator explorer, Bazaar catalog, or payment-scheme API.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/guides/reading-solana-tx">How to read a transaction</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/app">Open practice wallet</Link>
            </Button>
          </div>
        </header>
        <WalletLookupPanel />
      </div>
    </SiteChrome>
  );
}
