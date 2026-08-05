import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SiteChrome } from "@/components/site-chrome";
import { DonatePanel } from "@/components/donate-panel";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import {
  DONATION_CUSTOMARY_TIP_SOL,
  DONATION_GENEROUS_THRESHOLD_SOL,
  DONATION_MIN_SOL,
  DONATION_RESOURCE_PATH,
  DONATION_TIP_SUGGESTED_SOL,
} from "@/lib/donate";

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
            If these guides or tools helped, tip what you think it's worth. Optional
            and non-custodial. Suggested range{" "}
            {DONATION_TIP_SUGGESTED_SOL.join(" / ")} SOL (customary{" "}
            {DONATION_CUSTOMARY_TIP_SOL}). Anything above{" "}
            {DONATION_GENEROUS_THRESHOLD_SOL} SOL gets a special thank-you on the receipt —
            same free site either way.
          </p>
        </header>

        <DonatePanel />

        <section className="space-y-3 text-base text-muted">
          <h2 className="text-xl font-semibold text-fg">Agents (x402)</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <code className="text-fg">GET {DONATION_RESOURCE_PATH}</code> → HTTP 402
              with <code className="text-fg">extra.required=false</code> and suggested
              amounts
            </li>
            <li>
              Send ≥ {DONATION_MIN_SOL} SOL on mainnet to{" "}
              <code className="text-fg">payTo</code> (suggested 0.01–0.25)
            </li>
            <li>
              Retry with <code className="text-fg">X-PAYMENT</code> proof
            </li>
            <li>
              Server verifies on-chain → 200 receipt (
              <code className="text-fg">recognition: generous</code> when amount exceeds
              0.25 SOL)
            </li>
          </ol>
        </section>
      </div>
    </SiteChrome>
  );
}
