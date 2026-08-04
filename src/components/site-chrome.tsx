import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
import { BRAND, NAV_LINKS } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Marketing / docs chrome — shipx402.com product site */
export function SiteChrome({
  children,
  activePath,
}: {
  children: ReactNode;
  activePath?: string;
}) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="border-b border-border/60 bg-surface/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-xs text-subtle sm:px-6">
          <span className="font-mono tracking-wide">{BRAND.domain}</span>
          <span className="hidden sm:inline">Independent · client-side keys · agent-readable</span>
          <Link
            to="/app"
            className="font-medium text-fg underline decoration-primary decoration-2 underline-offset-2 hover:text-link-hover"
          >
            Launch app →
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Link to="/" className="no-underline">
            <BrandMark showDomain size="md" />
          </Link>
          <nav
            className="flex flex-wrap items-center gap-0.5 sm:gap-1"
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium no-underline transition-colors",
                  activePath === link.href
                    ? "bg-primary/15 text-primary"
                    : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/app"
              className="ml-1 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-fg no-underline hover:bg-primary/90"
            >
              Open app
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>

      <footer className="mt-8 border-t border-border/50 bg-surface/30 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3 sm:px-6">
          <div className="space-y-3">
            <BrandMark showDomain size="sm" />
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {BRAND.tagline}. Practice on Devnet. Ship when you understand the loop.
            </p>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">
              Product
            </div>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link to="/app" className="text-muted hover:text-fg">
                  Wallet app
                </Link>
              </li>
              <li>
                <Link to="/learn" className="text-muted hover:text-fg">
                  Learn x402
                </Link>
              </li>
              <li>
                <Link to="/agents" className="text-muted hover:text-fg">
                  Agents
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-muted hover:text-fg">
                  Donate
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted hover:text-fg">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">
              Developers
            </div>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link
                  to="/guides/ship-x402-api-solana"
                  className="text-muted hover:text-fg"
                >
                  Ship an x402 API
                </Link>
              </li>
              <li>
                <Link to="/guides/x402-vs-mpp" className="text-muted hover:text-fg">
                  x402 vs MPP
                </Link>
              </li>
              <li>
                <Link to="/ship" className="text-muted hover:text-fg">
                  Ship generator
                </Link>
              </li>
              <li>
                <Link to="/check" className="text-muted hover:text-fg">
                  402 Checker
                </Link>
              </li>
              <li>
                <a href="/llms.txt" className="text-muted hover:text-fg">
                  llms.txt
                </a>
              </li>
              <li>
                <a href="/api/agents/curriculum" className="text-muted hover:text-fg">
                  Agent curriculum API
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl space-y-2 border-t border-border/40 px-4 pt-6 text-center text-xs leading-relaxed text-subtle sm:px-6">
          <p>{BRAND.independence}</p>
          <p>
            © {new Date().getFullYear()} {BRAND.name} · {BRAND.domain}
          </p>
        </div>
      </footer>
    </div>
  );
}

export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // Links: cream text + teal underline (readable on charcoal and teal-tint panels)
        "space-y-4 text-base leading-relaxed text-muted",
        "[&_a]:text-link [&_a]:underline [&_a]:decoration-primary/80 [&_a]:decoration-2 [&_a]:underline-offset-[3px]",
        "hover:[&_a]:text-link-hover hover:[&_a]:decoration-primary",
        "[&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-fg sm:[&_h1]:text-4xl",
        "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fg sm:[&_h2]:text-2xl",
        "[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg",
        "[&_strong]:font-semibold [&_strong]:text-fg",
        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
        "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
        "[&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-fg",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-[var(--radius-lg)] [&_pre]:border [&_pre]:border-border [&_pre]:bg-bg [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:text-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}
