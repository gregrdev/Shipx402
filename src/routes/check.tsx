import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/site-chrome";
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
            Tools
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {SEO_PAGES.check.h1}
          </h1>
          <p className="text-lg text-muted">
            Paste an API URL. We fetch once (HTTPS only, SSRF-hardened) and grade the 402
            body for agent-readiness. Free — no accounts.
          </p>
          <Button asChild variant="secondary" size="sm">
            <Link to="/ship">Need middleware? Ship generator →</Link>
          </Button>
        </header>
        <Check402Panel />
      </div>
    </SiteChrome>
  );
}
