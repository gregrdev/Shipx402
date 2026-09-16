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
  DONATION_DEFAULT_SOL,
  DONATION_MIN_SOL,
  DONATION_TIERS,
  DONATION_RESOURCE_PATH,
  isDonationAddressConfigured,
  isGenerousDonation,
} from "@/lib/donate";
import { DonationQr } from "@/components/donation-qr";
import { copyText, cn } from "@/lib/utils";

/**
 * Donations for humans (exact wallet QR + Solana Pay link) and agents (x402).
 * The displayed QR is the owner's exact export for DONATION_ADDRESS — not regenerated.
 */
export function DonatePanel() {
  const configured = isDonationAddressConfigured();

  const [amount, setAmount] = useState<string>(String(DONATION_DEFAULT_SOL));
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

  const endpointUrl = DONATION_RESOURCE_PATH;
  const endpointUrlAbsolute =
    typeof window !== "undefined"
      ? `${window.location.origin}${DONATION_RESOURCE_PATH}`
      : DONATION_RESOURCE_PATH;

  const curlExample = `# 1. Discover the price tag (HTTP 402 + PAYMENT-REQUIRED)
curl -sI https://www.shipx402.com${DONATION_RESOURCE_PATH}

# 2. Send SOL on mainnet to the payTo address from PAYMENT-REQUIRED / the 402 body
#    (any wallet or SDK — you keep your keys)

# 3. Retry with PAYMENT-SIGNATURE (canonical V2; X-PAYMENT is the legacy V1 alias)
curl -s https://www.shipx402.com${DONATION_RESOURCE_PATH} -H "PAYMENT-SIGNATURE: <base64 proof with your tx signature>"`;

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
        x402Version: 2,
        scheme: "onchain-sol",
        network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
        payload: { signature },
      };
      const header =
        typeof btoa === "function"
          ? btoa(JSON.stringify(proof))
          : Buffer.from(JSON.stringify(proof), "utf8").toString("base64");

      const res = await fetch(DONATION_RESOURCE_PATH, {
        headers: {
          "PAYMENT-SIGNATURE": header,
          "X-PAYMENT": header,
        },
      });
      const body: unknown = await res.json();
      setReceiptResult({ ok: res.ok, status: res.status, body });
      if (res.ok) {
        const recognition =
          typeof body === "object" &&
          body !== null &&
          "recognition" in body &&
          (body as { recognition?: string }).recognition === "generous"
            ? "generous"
            : "standard";
        toast.success(
          recognition === "generous"
            ? "Huge thank you — generous donation verified"
            : "Donation verified — receipt ready",
        );
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
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="size-5 text-primary" />
            Tip what it's worth
          </CardTitle>
          <CardDescription>
            Optional Solana Pay QR. Suggested range 0.01–0.25 SOL. Anything above
            0.25 gets a special thank-you on the receipt — still optional either way.
          </CardDescription>
        </CardHeader>
        <div className="space-y-4 p-6 pt-0">
          <div className="flex justify-center">
            <DonationQr size={256} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Amount (SOL)</Label>
              <Input
                type="number"
                min={0}
                step="0.001"
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

          <div className="grid gap-2 sm:grid-cols-2">
            {DONATION_TIERS.map((tier) => (
              <button
                key={tier.sol}
                type="button"
                onClick={() => setAmount(String(tier.sol))}
                className={cn(
                  "rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors",
                  amount === String(tier.sol)
                    ? "border-primary/40 bg-primary/15"
                    : "border-border bg-surface hover:border-border-strong",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-fg">{tier.label}</span>
                  <span className="font-mono text-xs text-primary">
                    {tier.sol} {token}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{tier.blurb}</p>
                {tier.recommended ? (
                  <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Suggested default
                  </span>
                ) : null}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount("0.5")}
              className={cn(
                "rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors",
                isGenerousDonation(Number(amount))
                  ? "border-ember/50 bg-ember/15"
                  : "border-border bg-surface hover:border-border-strong",
              )}
              title="Anything above 0.25 SOL gets a special thank-you on the receipt"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-fg">0.26+ {token}</span>
                <span className="font-mono text-xs text-ember">generous</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Huge thank-you on the receipt. Edit the amount to any value you like.
              </p>
            </button>
          </div>

          {isGenerousDonation(Number(amount)) && (
            <p className="text-xs text-ember/90">
              Above the suggested range — if you send this, the receipt comes with a huge
              thank you. Still optional; every amount helps.
            </p>
          )}

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
              <div className="mt-3 space-y-2">
                {receiptResult.ok &&
                  typeof receiptResult.body === "object" &&
                  receiptResult.body !== null &&
                  "recognition" in receiptResult.body &&
                  (receiptResult.body as { recognition?: string }).recognition ===
                    "generous" && (
                    <div className="rounded-[var(--radius-md)] border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-fg">
                      <span className="font-semibold text-ember">Huge thank you.</span>{" "}
                      {(receiptResult.body as { message?: string }).message ??
                        "Your support went above the suggested range and it truly helps keep this free."}
                    </div>
                  )}
                <pre
                  className={cn(
                    "max-h-48 overflow-auto rounded-[var(--radius-md)] border p-3 font-mono text-[11px] leading-relaxed",
                    receiptResult.ok
                      ? "border-success/30 bg-success-bg text-success"
                      : "border-border bg-bg text-muted",
                  )}
                >
                  {`HTTP ${receiptResult.status}\n`}
                  {JSON.stringify(receiptResult.body, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            Agent tip (x402)
          </CardTitle>
          <CardDescription>
            Live mainnet 402. Agents GET the endpoint, send SOL, retry with proof.
            Tips are optional — suggested 0.01 / 0.05 / 0.25 SOL.
          </CardDescription>
        </CardHeader>
        <div className="space-y-4 p-6 pt-0">
          <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-subtle">
              Endpoint
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all font-mono text-xs text-fg">
                {endpointUrl}
              </code>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await copyText(endpointUrlAbsolute);
                  toast.success("Endpoint copied");
                }}
              >
                <Copy className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-subtle">
              payTo (mainnet)
            </div>
            <Input readOnly value={DONATION_ADDRESS} className="font-mono text-xs" />
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
            Preview the live 402
          </Button>

          {preview402 && (
            <pre className="max-h-56 overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-[11px] text-muted">
              {preview402}
            </pre>
          )}

          <pre className="overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-[11px] text-muted">
            {curlExample}
          </pre>

          <Badge variant="default">required: false · customary: 0.05 SOL</Badge>
        </div>
      </Card>
    </div>
  );
}
