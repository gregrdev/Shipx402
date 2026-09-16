import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd, softwareAppJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.wallet, {
      jsonLd: [
        softwareAppJsonLd(),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Wallet", path: "/wallet" },
        ]),
      ],
    }),
});

function WalletPage() {
  return (
    <SiteChrome activePath="/wallet">
      <Prose>
        <h1>{SEO_PAGES.wallet.h1}</h1>
        <p>
          The interactive wallet runs at <Link to="/app">/app</Link> (client-side only).
          This page explains the security model in crawlable HTML.
        </p>

        <h2>Keys never leave your device</h2>
        <p>
          Generation, signing, and encrypted backup use the browser's Web Crypto and
          Solana libraries in your tab. Keys never leave your device · never paste into
          chat/agents. Ship x402 does not run a database of private keys.
        </p>

        <h2>What you must write down</h2>
        <ol>
          <li>
            <strong>Public address</strong> — share to receive funds; save in notes or
            contacts.
          </li>
          <li>
            <strong>Private key (base58)</strong> — never share; required to reopen after
            lock, refresh, or a new device. Phantom/Solflare can import this format.
          </li>
          <li>
            <strong>Optional encrypted backup</strong> — password-protected{" "}
            <code>.enc.json</code> (PBKDF2 + AES-256-GCM) for multi-device restore without
            pasting the raw key every time.
          </li>
        </ol>

        <h2>Session model</h2>
        <ul>
          <li>Unlocked key lives only in tab memory</li>
          <li>Auto-lock after idle / background</li>
          <li>Network preference may persist; secrets never do</li>
        </ul>

        <h2>Honest limits</h2>
        <p>
          Browser wallets cannot stop malware or phishing. Keep mainnet balances modest;
          use hardware wallets for serious savings. Practice on Devnet first.{" "}
          <a
            href="https://www.shipx402.com/guides/first-solana-wallet"
            className="chip mx-1 inline-flex border border-border bg-bg px-2 py-0.5 text-xs font-medium text-muted no-underline hover:text-fg"
          >
            Devnet · practice network · free test money
          </a>
          <span className="chip mx-1 inline-flex border border-border bg-bg px-2 py-0.5 text-xs font-medium text-muted">
            Mainnet · real money · mistakes can’t be undone
          </span>
        </p>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/app">Create or open wallet</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/learn">Back to learn hub</Link>
          </Button>
        </div>
      </Prose>
    </SiteChrome>
  );
}
