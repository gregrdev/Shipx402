import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/first-solana-wallet")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.firstSolanaWallet, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.firstSolanaWallet),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          { name: "Your first Solana wallet", path: "/guides/first-solana-wallet" },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/first-solana-wallet">
      <Prose>
        <p className="text-sm text-subtle">Guide · Beginner · 2026</p>
        <h1>Your first Solana wallet (Devnet, no risk)</h1>
        <p>
          A crypto wallet sounds intimidating, but the core idea is small. A Solana
          wallet is really just two things, and once you see them clearly the rest
          makes sense.
        </p>

        <h2>A wallet is two things</h2>
        <ul>
          <li>
            <strong>Public address:</strong> safe to share. This is where people send
            funds. Think of it like an email address.
          </li>
          <li>
            <strong>Private key (or seed phrase):</strong> full control. Anyone who has
            it can move your money. Think of it like the password and the spare key
            combined. Never share it.
          </li>
        </ul>
        <p>
          That is the whole mental model. The public part is for receiving. The private
          part is for spending, and it stays yours alone.
        </p>

        <h2>Why start on Devnet</h2>
        <p>
          Solana has more than one network. <strong>Mainnet</strong> is the real one,
          where tokens have real value. <strong>Devnet</strong> is a practice network,
          where the tokens are free and worthless on purpose. It exists so you can learn
          and make mistakes without losing a cent.
        </p>
        <p>
          Start on Devnet every time you are trying something new. You can send,
          receive, and fumble around safely, then switch to Mainnet later once the steps
          feel routine.
        </p>

        <h2>The easy path: the practice wallet here</h2>
        <ol>
          <li>
            Open the <Link to="/app">practice wallet</Link> and create a wallet.
          </li>
          <li>Write the address and the private key down offline, on paper.</li>
          <li>Stay in Learn / Devnet mode.</li>
          <li>Use the airdrop button (or a faucet) to get free Devnet SOL.</li>
          <li>Try a send and a receive so the flow clicks.</li>
        </ol>
        <p>
          This site cannot recover a key you lose. Keys are generated in your browser
          and never stored on a server, which is good for privacy but means the backup
          is on you. Write it down before you close the tab.
        </p>

        <h2>The classic path: Phantom or Solflare</h2>
        <p>
          If you would rather use a mainstream wallet app, the steps are almost the
          same:
        </p>
        <ol>
          <li>Install Phantom or Solflare.</li>
          <li>Create a new wallet and save the seed phrase offline.</li>
          <li>Switch the network setting to Devnet.</li>
          <li>Copy your address.</li>
          <li>Request free Devnet SOL from faucet.solana.com.</li>
        </ol>
        <p>
          These wallets use a 12 or 24 word <strong>seed phrase</strong>, which is a
          human-friendly version of the private key. The same phrase can restore your
          wallet in another app later, which is why it has to stay secret.
        </p>

        <h2>What you must save</h2>
        <ul>
          <li>Your public address</li>
          <li>Your private key or seed phrase</li>
          <li>Which network you are on (Devnet or Mainnet)</li>
        </ul>
        <p>A screenshot in your camera roll is not a backup plan. Write it down.</p>

        <h2>Safety basics</h2>
        <ul>
          <li>Never paste a private key or seed phrase into chat, Discord, or a form.</li>
          <li>No real wallet support will ever ask for your seed phrase.</li>
          <li>Practice with small amounts.</li>
          <li>
            When balances get serious, use stronger storage than a random browser tab,
            such as a hardware wallet.
          </li>
        </ul>

        <h2>Next step</h2>
        <p>
          Once a wallet feels normal, watch a payment happen end to end in the
          interactive lab. That is where the x402 idea stops being abstract.
        </p>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/app">Open the practice wallet</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/learn">See the payment loop</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/what-is-x402">What is x402?</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-subtle">
          Ship x402 is an independent educational project. Not affiliated with the x402
          Foundation, Coinbase, or the Solana Foundation. Not financial advice.
        </p>
      </Prose>
    </SiteChrome>
  );
}
