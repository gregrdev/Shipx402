import { useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Copy,
  Heart,
  Link2,
  Loader2,
  Receipt,
  TerminalSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  encodeSolanaPayUrl,
  type PaymentToken,
} from "@/lib/solana-pay";
import {
  DONATION_ADDRESS,
  DONATION_MIN_SOL,
  DONATION_PRESETS_SOL,
  DONATION_RESOURCE_PATH,
  isDonationAddressConfigured,
} from "@/lib/donate";
import { DonationQr } from "@/components/donation-qr";
import { copyText, cn } from "@/lib/utils";

/**
 * Donations for humans (exact wallet QR + Solana Pay link) and agents (x402).
 * The displayed QR is the owner's exact export for DONATION_ADDRESS — not regenerated.
 */
export function DonatePanel() {
  const configured = isDonationAddressConfigured();

  const [amount, setAmount] = useState<string>(String(DONATION_PRESETS_SOL[0]));
  const [token, setToken] = useState<PaymentToken>("SOL");
  const [checking402, setChecking402] = useState(false);
  const [preview402, setPreview402] = useState<string | null>(null);
  const [receiptSig, setReceiptSig] = useState("");
  const [receiptBusy, setReceiptBusy] = useState(false);
  const [receiptResult, setReceiptResult] = useState<{
    ok: boolean;
    status: number;
    body: unknown;
  } | null>(null);

  const payUrl = useMemo(() => {
    if (!configured) return null;
    const amt = Number(amount);
    return encodeSolanaPayUrl({
      recipient: DONATION_ADDRESS,
      amount: Number.isFinite(amt) && amt > 0 ? amt : undefined,
      token,
      label: "Ship x402 donation",
      message: "Thanks for keeping the tutorial free!",
      network: "mainnet-beta",
    });
  }, [configured, amount, token]);

  const endpointUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${DONATION_RESOURCE_PATH}`
      : DONATION_RESOURCE_PATH;

  const curlExample = `# 1. Discover the price tag (HTTP 402)
curl -s ${endpointUrl}

# 2. Send SOL on mainnet to the payTo address from the 402 body
#    (any wallet or SDK — you keep your keys)

# 3. Retry with proof
curl -s ${endpointUrl} -H "X-PAYMENT: <base64 proof with your tx signature>"`;

  const show402 = async () => {
    setChecking402(true);
    setPreview402(null);
    try {
      const res = await fetch(DONATION_RESOURCE_PATH);
      const body: unknown = await res.json();
      setPreview402(`HTTP ${res.status}\n` + JSON.stringify(body, null, 2));
    } catch {
      toast.error("Could not reach the donate endpoint");
    } finally {
      setChecking402(false);
    }
  };

  const claimReceipt = async () => {
    const signature = receiptSig.trim();
    if (!signature) {
      toast.error("Paste a transaction signature from Solana Explorer / your wallet");
      return;
    }
    setReceiptBusy(true);
    setReceiptResult(null);
    try {
      const proof = {
        x402Version: 1,
        scheme: "onchain-sol",
        network: "solana",
        payload: { signature },
      };
      const header =
        typeof btoa === "function"
          ? btoa(JSON.stringify(proof))
          : Buffer.from(JSON.stringify(proof), "utf8").toString("base64");

      const res = await fetch(DONATION_RESOURCE_PATH, {
        headers: { "X-PAYMENT": header },
      });
      const body: unknown = await res.json();
      setReceiptResult({ ok: res.ok, status: res.status, body });
      if (res.ok) {
        toast.success("Donation verified — receipt ready");
      } else {
        const reason =
          typeof body === "object" &&
          body &&
          "reason" in body &&
          typeof (body as { reason: unknown }).reason === "string"
            ? (body as { reason: string }).reason
            : "Verification failed";
        toast.error(reason);
      }
    } catch {
      toast.error("Could not reach the donate endpoint");
    } finally {
      setReceiptBusy(false);
    }
  };

  if (!configured) {
    return (
      <Card className="border-warn/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="size-5 text-warn" />
            Donations — setup needed
          </CardTitle>
          <CardDescription>
            Site owner: set <code className="text-fg">DONATION_ADDRESS</code> in{" "}
            <code className="text-fg">src/lib/donate.ts</code>.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="flex flex-col items-center text-center">
        <CardHeader className="w-full">
          <div className="mb-1 flex flex-wrap items-center justify-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Heart className="size-5 text-primary" />
              Support Ship x402
            </CardTitle>
            <Badge variant="real">Mainnet · Solana</Badge>
          </div>
          <CardDescription>
            Scan a standard Solana Pay QR generated from the donation address below. Any amount of SOL works — funds go on-chain only, no middleman.
          </CardDescription>
        </CardHeader>

        <div className="mb-2 w-full">
          <DonationQr size={256} />
        </div>

        <div className="w-full space-y-3 text-left">
          <div>
            <Label>Donation address</Label>
            <div className="flex gap-2">
              <Input readOnly value={DONATION_ADDRESS} className="font-mono text-xs" />
              <Button
                variant="secondary"
                size="icon"
                aria-label="Copy donation address"
                onClick={async () => {
                  await copyText(DONATION_ADDRESS);
                  toast.success("Donation address copied");
                }}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Suggested amount (for Solana Pay link)</Label>
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Token</Label>
              <div className="flex h-11 overflow-hidden rounded-[var(--radius-md)] border border-border">
                {(["SOL", "USDC"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={cn(
                      "flex-1 text-sm font-medium transition-colors",
                      token === t
                        ? "bg-surface-2 text-fg"
                        : "bg-bg text-muted hover:text-fg",
                    )}
                    onClick={() => setToken(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {DONATION_PRESETS_SOL.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  amount === String(p)
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border bg-surface text-muted hover:text-fg",
                )}
              >
                {p} {token}
              </button>
            ))}
          </div>

          {payUrl && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                await copyText(payUrl);
                toast.success("Solana Pay link copied (amount pre-filled)");
              }}
            >
              <Link2 className="size-4" />
              Copy Solana Pay link (optional amount)
            </Button>
          )}
          <p className="text-xs text-subtle">
            The QR is generated in-browser from DONATION_ADDRESS (provably the same
            payTo). The optional link only pre-fills an amount in compatible wallets.
          </p>

          <div className="rounded-[var(--radius-lg)] border border-primary/25 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-base font-semibold text-fg">
              <Receipt className="size-4 text-primary" />
              Get your receipt
            </div>
            <p className="mb-3 text-sm text-muted">
              After sending ≥ {DONATION_MIN_SOL} SOL on mainnet, paste the transaction
              signature. Same verify path agents use.
            </p>
            <Label>Transaction signature</Label>
            <Input
              className="font-mono text-xs"
              placeholder="Paste base58 signature from Phantom / Explorer"
              value={receiptSig}
              onChange={(e) => setReceiptSig(e.target.value)}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <Button
              className="mt-3 w-full"
              disabled={receiptBusy || !receiptSig.trim()}
              onClick={() => void claimReceipt()}
            >
              {receiptBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Verify & show receipt
            </Button>
            {receiptResult && (
              <pre
                className={cn(
                  "mt-3 max-h-48 overflow-auto rounded-[var(--radius-md)] border p-3 font-mono text-[11px] leading-relaxed",
                  receiptResult.ok
                    ? "border-success/30 bg-success-bg text-success"
                    : "border-border bg-bg text-muted",
                )}
              >
                {`HTTP ${receiptResult.status}\n`}
                {JSON.stringify(receiptResult.body, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Bot className="size-5 text-primary" />
              Agents donate via x402
            </CardTitle>
            <Badge variant="learn">Live endpoint</Badge>
          </div>
          <CardDescription>
            Real SOL on mainnet to the same address. Minimum {DONATION_MIN_SOL} SOL.
          </CardDescription>
        </CardHeader>

        <div className="space-y-3">
          <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <div className="text-xs uppercase tracking-wide text-subtle">payTo</div>
            <div className="mt-1 break-all font-mono text-sm text-fg">
              {DONATION_ADDRESS}
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <div className="text-xs uppercase tracking-wide text-subtle">Endpoint</div>
            <div className="mt-1 break-all font-mono text-sm text-fg">
              GET {endpointUrl}
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            disabled={checking402}
            onClick={() => void show402()}
          >
            {checking402 ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <TerminalSquare className="size-4" />
            )}
            Preview the 402 price tag
          </Button>

          {preview402 && (
            <pre className="max-h-64 overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-[11px] leading-relaxed text-muted">
              {preview402}
            </pre>
          )}

          <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-xs uppercase tracking-wide text-subtle">
                For agents & builders
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await copyText(curlExample);
                  toast.success("curl example copied");
                }}
              >
                <Copy className="size-3.5" />
                Copy
              </Button>
            </div>
            <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-muted">
              {curlExample}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
