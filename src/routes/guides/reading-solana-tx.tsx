import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guides/reading-solana-tx")({
  component: GuidePage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.readingSolanaTx, {
      jsonLd: [
        articleJsonLd(SEO_PAGES.readingSolanaTx),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/learn" },
          {
            name: "Reading a Solana transaction",
            path: "/guides/reading-solana-tx",
          },
        ]),
      ],
    }),
});

function GuidePage() {
  return (
    <SiteChrome activePath="/guides/reading-solana-tx">
      <Prose>
        <p className="text-sm text-subtle">Guide · Beginner · 2026</p>
        <h1>Reading a Solana transaction on Solscan</h1>
        <p>
          After you send SOL (or an agent pays an x402 endpoint), you will want to
          prove it. Wallet UIs can feel noisy. A block explorer is the calm version of
          the truth.
        </p>

        <h2>What you need</h2>
        <ul>
          <li>
            A <strong>transaction signature</strong> (base58 string, often 88 chars) —
            not the private key.
          </li>
          <li>
            The correct cluster: <strong>Devnet</strong> vs <strong>Mainnet</strong>.
            Looking on the wrong one looks like “tx not found.”
          </li>
        </ul>

        <h2>Steps</h2>
        <ol>
          <li>Copy the signature from your wallet activity or API receipt.</li>
          <li>
            Open{" "}
            <a
              href="https://solscan.io"
              className="link-readable"
              rel="noreferrer"
              target="_blank"
            >
              solscan.io
            </a>{" "}
            (or your preferred explorer).
          </li>
          <li>Paste the signature into search.</li>
          <li>
            Confirm the network toggle matches where you sent (Mainnet-Beta vs Devnet).
          </li>
        </ol>

        <h2>Fields that matter</h2>
        <ul>
          <li>
            <strong>Status / result:</strong> success vs failed. Failed transfers do not
            count as payment proof.
          </li>
          <li>
            <strong>Signer / fee payer:</strong> who authorized the transaction.
          </li>
          <li>
            <strong>Account balance changes:</strong> who lost SOL/tokens and who gained.
            For donations, the receive address balance should increase.
          </li>
          <li>
            <strong>Token transfers:</strong> for USDC, look at SPL token balance
            changes, not only native SOL.
          </li>
          <li>
            <strong>Timestamp / slot:</strong> useful when a server rejects “too old”
            proofs.
          </li>
          <li>
            <strong>Program logs:</strong> advanced debugging when a program rejects an
            instruction.
          </li>
        </ul>

        <h2>Connecting this to x402</h2>
        <p>
          Some sellers (including this site’s donate endpoint) accept a transaction
          signature as proof. The server re-reads the chain via RPC and checks that the
          right address received at least the minimum amount. Solscan is how{" "}
          <em>you</em> double-check the same facts by eye.
        </p>

        <h2>Common confusions</h2>
        <ul>
          <li>
            <strong>“Phantom looks janky”:</strong> explorers show the same data with
            less UI chrome. Trust confirmed chain state over a loading spinner.
          </li>
          <li>
            <strong>Wrong cluster:</strong> Devnet signatures never appear on mainnet
            explorers.
          </li>
          <li>
            <strong>Private key ≠ signature:</strong> never paste a private key into
            Solscan or a chat.
          </li>
        </ul>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/explorer">Check a wallet’s balance</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/guides/first-solana-wallet">First wallet guide</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/guides/what-is-an-rpc">What Is an RPC?</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-subtle">
          Ship x402 is an independent educational project. Not financial advice.
        </p>
      </Prose>
    </SiteChrome>
  );
}
