import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { BRAND, SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.about, {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]),
      ],
    }),
});

function AboutPage() {
  return (
    <SiteChrome activePath="/about">
      <Prose>
        <h1>{SEO_PAGES.about.h1}</h1>
        <p>
          <strong>{BRAND.name}</strong> ({BRAND.domain}) is an independent educational
          project: learn the x402 HTTP 402 payment loop, practice with a client-side
          Solana wallet, and ship pay-per-request APIs — with pages and endpoints agents
          can read.
        </p>
        <p>{BRAND.independence}</p>
        <h2>What we built</h2>
        <ul>
          <li>
            <Link to="/learn">Learn x402</Link> + live lab
          </li>
          <li>
            <Link to="/app">Practice wallet</Link> (client-side keys)
          </li>
          <li>
            <Link to="/ship">Ship generator</Link> &{" "}
            <Link to="/check">402 Checker</Link>
          </li>
          <li>
            Agent curriculum at{" "}
            <a href="/api/agents/curriculum">/api/agents/curriculum</a>
          </li>
        </ul>
        <h2>Contact</h2>
        <p>
          Reach the project via X/Twitter{" "}
          <a href={`https://x.com/${BRAND.twitter.replace("@", "")}`}>
            {BRAND.twitter}
          </a>
          . Source repository link can be added here once published.
        </p>
      </Prose>
    </SiteChrome>
  );
}
