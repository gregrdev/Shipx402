import { useEffect, useMemo, useState } from "react";
import { Copy, Link2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  createPaymentQrDataUrl,
  createReference,
  encodeSolanaPayUrl,
  type PaymentToken,
} from "@/lib/solana-pay";
import type { NetworkMode } from "@/lib/solana";
import { copyText } from "@/lib/utils";

export function ReceivePanel({
  publicKey,
  network,
}: {
  publicKey: string;
  network: NetworkMode;
}) {
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<PaymentToken>("SOL");
  const [label, setLabel] = useState("Ship x402");
  const [message, setMessage] = useState("Thanks for sending!");
  const [memo, setMemo] = useState("");
  const [reference, setReference] = useState(() => createReference());
  const [qr, setQr] = useState<string | null>(null);

  const payUrl = useMemo(() => {
    const amt = amount.trim() === "" ? undefined : Number(amount);
    return encodeSolanaPayUrl({
      recipient: publicKey,
      amount: amt !== undefined && !Number.isNaN(amt) && amt > 0 ? amt : undefined,
      token,
      label: label.trim() || undefined,
      message: message.trim() || undefined,
      memo: memo.trim() || undefined,
      reference,
      network,
    });
  }, [publicKey, amount, token, label, message, memo, reference, network]);

  useEffect(() => {
    let cancelled = false;
    createPaymentQrDataUrl(payUrl).then((data) => {
      if (!cancelled) setQr(data);
    });
    return () => {
      cancelled = true;
    };
  }, [payUrl]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="flex flex-col items-center text-center">
        <CardHeader className="w-full">
          <CardTitle>Receive</CardTitle>
          <CardDescription>
            Scan with any Solana Pay wallet (Phantom, Solflare, etc.) or share the link.
          </CardDescription>
        </CardHeader>

        <div className="mb-4 rounded-[var(--radius-xl)] border border-border bg-fg p-3">
          {qr ? (
            <img
              src={qr}
              alt="Solana Pay QR code"
              className="size-56 sm:size-64"
              width={256}
              height={256}
            />
          ) : (
            <div className="flex size-56 items-center justify-center text-sm text-subtle sm:size-64">
              Generating QR…
            </div>
          )}
        </div>

        <div className="w-full space-y-2 text-left">
          <Label>Wallet address</Label>
          <div className="flex gap-2">
            <Input readOnly value={publicKey} className="font-mono text-xs" />
            <Button
              variant="secondary"
              size="icon"
              onClick={async () => {
                await copyText(publicKey);
                toast.success("Address copied");
              }}
            >
              <Copy className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 w-full space-y-2 text-left">
          <Label>Solana Pay link</Label>
          <div className="flex gap-2">
            <Input readOnly value={payUrl} className="font-mono text-[10px] sm:text-xs" />
            <Button
              variant="secondary"
              size="icon"
              onClick={async () => {
                await copyText(payUrl);
                toast.success("Payment link copied");
              }}
            >
              <Link2 className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment request</CardTitle>
          <CardDescription>
            Customize amount and labels. QR and link update live.
          </CardDescription>
        </CardHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <Input
                inputMode="decimal"
                placeholder="Optional"
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
                    className={`flex-1 text-sm font-medium transition-colors ${
                      token === t
                        ? "bg-surface-2 text-fg"
                        : "bg-bg text-muted hover:text-fg"
                    }`}
                    onClick={() => setToken(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <Label>Message</Label>
            <Input value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div>
            <Label>Memo (on-chain)</Label>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Optional order id or note"
            />
          </div>

          <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-medium text-fg">Payment reference</div>
                <div className="mt-0.5 break-all font-mono text-[10px] text-muted">
                  {reference}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReference(createReference());
                  toast.message("New reference generated");
                }}
              >
                <RefreshCw className="size-3.5" />
                New
              </Button>
            </div>
            <p className="mt-2 text-xs text-subtle">
              Unique id wallets attach so you can match payments later.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
