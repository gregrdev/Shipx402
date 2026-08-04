import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Heart } from "lucide-react";
import { SiteChrome } from "@/components/site-chrome";
import { DonationQr } from "@/components/donation-qr";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import {
  DONATION_ADDRESS,
  DONATION_MIN_SOL,
  DONATION_RESOURCE_PATH,
  isDonationAddressConfigured,
} from "@/lib/donate";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/donate")({
  component: DonatePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.donate, {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Donate", path: "/donate" },
        ]),
      ],
    }),
});

function DonatePage() {
  const configured = isDonationAddressConfigured();

  return (
    <SiteChrome activePath="/donate">
      <div className="space-y-10 animate-fade-up">
        <header className="max-w-2xl space-y-3">
          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-primary">
            <Heart className="size-3.5" />
            Support
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {SEO_PAGES.donate.h1}
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            Optional and non-custodial. The QR is generated from the address (not a static
            image), so scanners always match the on-chain payTo used by agents.
          </p>
        </header>

        {configured && (
          <section className="grid gap-8 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-start">
            <DonationQr size={280} />

            <div className="space-y-5 rounded-[var(--radius-xl)] border border-border bg-surface p-5 sm:p-6">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-subtle">
                  Donation address (mainnet)
                </div>
                <code className="mt-2 block break-all rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 font-mono text-sm text-fg">
                  {DONATION_ADDRESS}
                </code>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/app">Open app donate panel</Link>
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(DONATION_ADDRESS);
                  }}
                >
                  <Copy className="size-4" />
                  Copy address
                </Button>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                Agent x402 path requires ≥ {DONATION_MIN_SOL} SOL, then a receipt via the
                app. Endpoint:{" "}
                <code className="text-fg">{DONATION_RESOURCE_PATH}</code>
              </p>
            </div>
          </section>
        )}

        <section className="space-y-3 text-base text-muted">
          <h2 className="text-xl font-semibold text-fg">Agents (x402)</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <code className="text-fg">GET {DONATION_RESOURCE_PATH}</code> → HTTP 402
            </li>
            <li>
              Send ≥ {DONATION_MIN_SOL} SOL on mainnet to{" "}
              <code className="text-fg">payTo</code>
            </li>
            <li>
              Retry with <code className="text-fg">X-PAYMENT</code> proof
            </li>
            <li>Server verifies on-chain → 200 receipt</li>
          </ol>
        </section>
      </div>
    </SiteChrome>
  );
}
