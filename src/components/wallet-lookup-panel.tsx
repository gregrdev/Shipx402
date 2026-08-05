import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { WalletLookupResult } from "@/lib/wallet-lookup";
import type { NetworkMode } from "@/lib/solana";
import { copyText, cn, shortAddress } from "@/lib/utils";

function formatSol(n: number) {
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  if (Math.abs(n) >= 0.0001)
    return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
  return n.toExponential(2);
}

function formatTime(unix: number | null) {
  if (!unix) return "—";
  try {
    return new Date(unix * 1000).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export function WalletLookupPanel({
  defaultAddress = "",
  defaultNetwork = "mainnet-beta",
}: {
  defaultAddress?: string;
  defaultNetwork?: NetworkMode;
}) {
  const [address, setAddress] = useState(defaultAddress);
  const [network, setNetwork] = useState<NetworkMode>(defaultNetwork);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WalletLookupResult | null>(null);

  const run = async () => {
    const a = address.trim();
    if (!a) {
      setError("Paste a wallet address first");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/wallet/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: a, network, limit: 15 }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        result?: WalletLookupResult;
        error?: string;
        reason?: string;
        hint?: string;
      };
      if (!res.ok || !data.result) {
        setResult(null);
        setError(
          [data.error, data.reason, data.hint].filter(Boolean).join(" — ") ||
            `Lookup failed (${res.status})`,
        );
        return;
      }
      setResult(data.result);
    } catch {
      setResult(null);
      setError("Could not reach lookup API");
    } finally {
      setBusy(false);
    }
  };

  const valueLine = useMemo(() => {
    if (!result) return null;
    if (result.valueUsd != null && result.solUsd != null) {
      return {
        usd: result.valueUsd,
        price: result.solUsd,
      };
    }
    return null;
  }, [result]);

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 cyber-edge">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/15 text-primary">
            <Wallet className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg">
              Check SOL balance & transactions
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Paste any public wallet address. We read the chain only — never ask for a
              private key. Mainnet for real funds; Devnet for practice.
            </p>
          </div>
        </div>

        <Label htmlFor="wallet-address">Wallet address</Label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <Input
            id="wallet-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void run();
            }}
            placeholder="Base58 public key (e.g. from Phantom)"
            className="font-mono text-sm"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
          <Button
            disabled={busy || !address.trim()}
            onClick={() => void run()}
            className="shrink-0"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Look up
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-subtle">
            Network
          </span>
          {(
            [
              { id: "mainnet-beta", label: "Mainnet" },
              { id: "devnet", label: "Devnet" },
            ] as const
          ).map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNetwork(n.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                network === n.id
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-bg text-muted hover:border-border-strong hover:text-fg",
              )}
              aria-pressed={network === n.id}
            >
              {n.label}
            </button>
          ))}
          {result && (
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => void run()}
              className="ml-auto"
            >
              <RefreshCw className={cn("size-3.5", busy && "animate-spin")} />
              Refresh
            </Button>
          )}
        </div>

        <p className="mt-3 text-xs text-subtle">
          Never paste a private key or seed phrase here. Addresses are public; keys are
          not.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-[var(--radius-lg)] border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-fade-up">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[var(--radius-xl)] border border-primary/25 bg-primary/5 p-5 sm:col-span-2 hearth-panel">
              <div className="text-xs font-semibold uppercase tracking-wide text-subtle">
                Balance
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                  {formatSol(result.balanceSol)}
                </span>
                <span className="text-lg text-primary">SOL</span>
              </div>
              {valueLine ? (
                <p className="mt-2 text-base text-muted">
                  ≈{" "}
                  <span className="font-semibold text-fg">
                    ${valueLine.usd.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>{" "}
                  USD
                  <span className="text-subtle">
                    {" "}
                    · SOL @ ${valueLine.price.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-subtle">
                  USD estimate unavailable right now (price feed). SOL balance is
                  on-chain.
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={result.network === "devnet" ? "learn" : "real"}>
                  {result.network === "devnet" ? "Devnet" : "Mainnet"}
                </Badge>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
                  onClick={() => {
                    void copyText(result.address).then(() =>
                      toast.success("Address copied"),
                    );
                  }}
                >
                  <Copy className="size-3.5" />
                  {shortAddress(result.address, 6)}
                </button>
                <a
                  href={`https://explorer.solana.com/address/${result.address}${
                    result.network === "devnet" ? "?cluster=devnet" : ""
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
                >
                  Explorer
                  <ExternalLink className="size-3.5" />
                </a>
                <a
                  href={`https://solscan.io/account/${result.address}${
                    result.network === "devnet" ? "?cluster=devnet" : ""
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
                >
                  Solscan
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-subtle">
                Snapshot
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Lamports</dt>
                  <dd className="font-mono text-fg">
                    {result.balanceLamports.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Recent txs shown</dt>
                  <dd className="font-mono text-fg">
                    {result.transactionCountHint}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Fetched</dt>
                  <dd className="text-fg">
                    {new Date(result.fetchedAt).toLocaleTimeString()}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-subtle">
                Learn to read a transfer:{" "}
                <Link to="/guides/reading-solana-tx" className="link-readable">
                  Solscan guide
                </Link>
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
            <div className="border-b border-border/60 px-5 py-4">
              <h3 className="text-base font-semibold text-fg">
                Recent transactions
              </h3>
              <p className="mt-0.5 text-sm text-muted">
                Newest first. SOL change is this address's balance delta for each
                tx (fees included).
              </p>
            </div>

            {result.transactions.length === 0 ? (
              <p className="px-5 py-8 text-sm text-subtle">
                No recent signatures found on this network. Wrong cluster, brand-new
                wallet, or RPC lag.
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {result.transactions.map((tx) => {
                  const positive =
                    tx.solDelta != null && tx.solDelta > 0
                      ? true
                      : tx.solDelta != null && tx.solDelta < 0
                        ? false
                        : null;
                  return (
                    <li
                      key={tx.signature}
                      className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
                            tx.status === "failed"
                              ? "border-danger/30 bg-danger-bg text-danger"
                              : positive === true
                                ? "border-success/30 bg-success-bg text-success"
                                : positive === false
                                  ? "border-ember/30 bg-real-bg text-ember"
                                  : "border-border bg-bg text-muted",
                          )}
                        >
                          {positive === true ? (
                            <ArrowDownLeft className="size-4" />
                          ) : positive === false ? (
                            <ArrowUpRight className="size-4" />
                          ) : (
                            <RefreshCw className="size-3.5" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className="font-mono text-sm text-fg hover:underline"
                              onClick={() => {
                                void copyText(tx.signature).then(() =>
                                  toast.success("Signature copied"),
                                );
                              }}
                            >
                              {shortAddress(tx.signature, 8)}
                            </button>
                            <Badge
                              variant={
                                tx.status === "failed" ? "danger" : "success"
                              }
                            >
                              {tx.status}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-subtle">
                            {formatTime(tx.blockTime)}
                            {tx.memo ? ` · memo: ${tx.memo}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pl-11 sm:pl-0">
                        {tx.solDelta != null ? (
                          <span
                            className={cn(
                              "font-mono text-sm font-medium",
                              positive === true && "text-success",
                              positive === false && "text-ember",
                              positive === null && "text-muted",
                            )}
                          >
                            {positive === true ? "+" : ""}
                            {formatSol(tx.solDelta)} SOL
                          </span>
                        ) : (
                          <span className="text-sm text-subtle">Δ n/a</span>
                        )}
                        <a
                          href={tx.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted hover:border-primary/40 hover:text-fg"
                          aria-label="Open transaction"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
