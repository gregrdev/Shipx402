import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/x402-vs-mpp")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.x402VsMpp, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.x402VsMpp),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          { name: "x402 vs MPP", path: "/guides/x402-vs-mpp" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/x402-vs-mpp">
      <Prose>
        <p className="text-sm text-subtle">Guide · Updated 2026</p>
        <h1>x402 vs Stripe MPP: which should you use in 2026?</h1>
        <p>
          Two systems woke up the same idea: let machines pay over the web using HTTP{" "}
          <strong>402 Payment Required</strong>.
        </p>
        <p>
          <strong>x402</strong> came from Coinbase in 2025 and is now an open standard
          under the x402 Foundation. <strong>MPP</strong> (Machine Payments Protocol)
          launched March 18, 2026 from Stripe and Tempo.
        </p>
        <p>
          They solve a similar problem. They are not the same tool. This guide is a
          practical decision aid, not a standards document.
        </p>

        <h2>Quick comparison</h2>
        <div className="not-prose overflow-x-auto rounded-[var(--radius-lg)] border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-surface-2 text-fg">
              <tr>
                <th className="p-3 font-semibold"> </th>
                <th className="p-3 font-semibold">x402</th>
                <th className="p-3 font-semibold">MPP</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {[
                ["Style", "Open protocol", "Stripe + Tempo system"],
                [
                  "Payments",
                  "Mostly crypto / stablecoins",
                  "Crypto plus cards, wallets, and more",
                ],
                [
                  "Billing shape",
                  "Pay per request",
                  "Pay per request, or open a session and stream many tiny payments",
                ],
                [
                  "Best for",
                  "Agents, micropayments, open APIs",
                  "High-volume sessions, hybrid fiat, teams already on Stripe",
                ],
                ["Lock-in", "Low", "Higher (Stripe ecosystem)"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-border">
                  <td className="p-3 font-medium text-fg">{row[0]}</td>
                  <td className="p-3">{row[1]}</td>
                  <td className="p-3">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Choose x402 if you want</h2>
        <ul>
          <li>Tiny payments that would die under card fees</li>
          <li>Buyers who do not need an account</li>
          <li>An open setup you can host yourself</li>
          <li>Solana or Base stablecoin settlement</li>
        </ul>

        <h2>Choose MPP if you want</h2>
        <ul>
          <li>Session-style spending (authorize a budget, then use it fast)</li>
          <li>Fiat and crypto in one flow</li>
          <li>Stripe fraud tools, refunds, and reporting</li>
          <li>Enterprise-friendly compliance defaults</li>
        </ul>

        <h2>Can you use both?</h2>
        <p>
          Yes. Some products use x402 for open agent traffic and Stripe or MPP for human
          or enterprise buyers. That is a normal split, not a contradiction. Stripe also
          participates in the broader x402 ecosystem, which is another signal this is
          convergence more than a rivalry.
        </p>

        <h2>Simple rule</h2>
        <p>
          <strong>Micropayments and open agent access:</strong> start with x402.
          <br />
          <strong>High-frequency sessions and card rails:</strong> start with MPP.
          <br />
          <strong>Still unsure:</strong> prototype x402 on Solana devnet in an afternoon,
          then decide with real numbers.
        </p>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/ship">Generate x402 middleware</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/guides/what-is-x402">What Is x402?</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/ship-x402-api-solana">Build on Solana</Link>
          </Button>
        </div>
      </Prose>
    </SiteChrome>
  );
}
