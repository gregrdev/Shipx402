import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/site-chrome";
import { SupportNudge } from "@/components/support-nudge";
import { Check402Panel } from "@/components/check-402-panel";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/check")({
  component: CheckPage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.check, {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "402 Checker", path: "/check" },
        ]),
      ],
    }),
});

function CheckPage() {
  return (
    <SiteChrome activePath="/check">
      <div className="space-y-8 animate-fade-up">
        <header className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
            Tools · free grade
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {SEO_PAGES.check.h1}
          </h1>
          <p className="text-lg text-muted">
            Paste an API URL. We fetch once over HTTPS (with SSRF protection) and grade
            the 402 (headers first) for agent readiness. Free · no account.
          </p>
          <p className="text-sm text-subtle">
            Test a known 402:{" "}
            <code className="text-fg">/api/x402/donate</code> (returns a Solana payTo
            — the receiving wallet address).
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/ship">Need middleware? Open Ship generator</Link>
            </Button>
            <span className="text-sm text-muted">
              Ship generator — paste-ready middleware
            </span>
            <Button asChild variant="outline" size="sm">
              <Link to="/loop">Walk the loop</Link>
            </Button>
          </div>
        </header>
        <Check402Panel />
        <SupportNudge className="mt-10" />
      </div>
    </SiteChrome>
  );
}
