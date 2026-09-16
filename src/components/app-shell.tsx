import { Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Welcome } from "@/components/welcome";
import { CreateWallet } from "@/components/create-wallet";
import { ImportWallet } from "@/components/import-wallet";
import { Dashboard } from "@/components/dashboard";
import { BrandMark } from "@/components/brand-mark";
import { useWalletStore } from "@/lib/wallet-store";
import { CreatedWithGrokBanner } from "@/components/created-with-grok-banner";
import { BRAND } from "@/lib/brand";

export function AppShell() {
  const phase = useWalletStore((s) => s.phase);
  const publicKey = useWalletStore((s) => s.publicKey);
  const secretKey = useWalletStore((s) => s.secretKey);

  const effectivePhase =
    phase === "dashboard" && (!publicKey || !secretKey) ? "welcome" : phase;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <CreatedWithGrokBanner />
      <header className="border-b border-border/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="no-underline">
            <BrandMark variant="tile" showDomain size="md" />
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link to="/learn" hash="path" className="text-muted hover:text-fg">
              Learn x402
            </Link>
            <Link to="/agents" className="text-muted hover:text-fg">
              Agents
            </Link>
            <span className="hidden font-mono text-xs text-subtle sm:inline">
              app · {BRAND.domain}
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-9 sm:px-6 sm:py-12">
        {effectivePhase === "welcome" && <Welcome />}
        {effectivePhase === "create" && <CreateWallet />}
        {effectivePhase === "import" && <ImportWallet />}
        {effectivePhase === "dashboard" && <Dashboard />}
      </main>

      <footer className="border-t border-border/50 py-7">
        <div className="mx-auto max-w-5xl space-y-2 px-4 text-center text-sm text-muted sm:px-6">
          <p>
            Ship x402 wallet app — keys generated and signed only on your device. Practice
            on Devnet (practice chain, free test SOL — no real money) before real funds.
          </p>
          <p className="text-xs leading-relaxed text-fg/90">{BRAND.independence}</p>
          <p className="flex flex-wrap justify-center gap-3 text-xs">
            <Link to="/" className="text-muted hover:text-fg">
              {BRAND.domain}
            </Link>
            <Link to="/learn" hash="path" className="text-muted hover:text-fg">
              Learn x402
            </Link>
            <a href="/llms.txt" className="text-muted hover:text-fg">
              llms.txt
            </a>
          </p>
        </div>
      </footer>

      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className: "border border-border bg-surface text-fg text-base",
        }}
      />
    </div>
  );
}
