import { useState } from "react";
import { ExternalLink, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  TransferError,
  explorerTxUrl,
  isValidSolanaAddress,
  transferSol,
  type NetworkMode,
} from "@/lib/solana";

export function SendPanel({
  secretKey,
  network,
  onSent,
}: {
  secretKey: string;
  network: NetworkMode;
  onSent?: () => void;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [lastSig, setLastSig] = useState<string | null>(null);
  const [maybeSent, setMaybeSent] = useState(false);

  const onSend = async () => {
    const amt = Number(amount);
    if (!isValidSolanaAddress(to.trim())) {
      toast.error("Enter a valid Solana address");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a positive amount");
      return;
    }

    setSending(true);
    setMaybeSent(false);
    try {
      const sig = await transferSol({
        secretKeyBase58: secretKey,
        toAddress: to.trim(),
        amountSol: amt,
        network,
      });
      setLastSig(sig);
      toast.success("Transfer confirmed");
      onSent?.();
    } catch (err) {
      if (err instanceof TransferError && err.signature) {
        setLastSig(err.signature);
        setMaybeSent(true);
        toast.error(
          "Confirmation timed out — check the explorer before sending again (may already be on-chain)",
        );
      } else {
        const msg = err instanceof Error ? err.message : "Transfer failed";
        toast.error(msg);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Send SOL</CardTitle>
        <CardDescription>
          Signs and submits a system transfer from this wallet. Network fee is paid from
          the same balance (~0.000005 SOL).
        </CardDescription>
      </CardHeader>

      <div className="space-y-3">
        <div>
          <Label>Recipient address</Label>
          <Input
            className="font-mono text-xs"
            placeholder="Base58 public key"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <div>
          <Label>Amount (SOL)</Label>
          <Input
            inputMode="decimal"
            placeholder="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3 text-sm text-muted">
          <strong className="text-fg">What happens:</strong> your private key signs a
          transfer instruction. Solana validators check the signature, debit your
          account, and credit the recipient.
        </div>

        <Button className="w-full" disabled={sending} onClick={() => void onSend()}>
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {sending ? "Sending…" : "Send SOL"}
        </Button>

        {lastSig && (
          <div
            className={`break-all rounded-[var(--radius-md)] border p-3 text-sm ${
              maybeSent
                ? "border-warn/30 bg-warn-bg text-warn"
                : "border-success/25 bg-success-bg text-success"
            }`}
          >
            <div className="font-medium">
              {maybeSent ? "Possible on-chain transfer" : "Confirmed signature"}
            </div>
            <div className="mt-1 font-mono text-xs opacity-90">{lastSig}</div>
            <a
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline"
              href={explorerTxUrl(lastSig, network)}
              target="_blank"
              rel="noreferrer"
            >
              Open in Solana Explorer
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
