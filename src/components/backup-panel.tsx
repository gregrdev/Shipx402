import { useState } from "react";
import { Download, Loader2, Lock, PenLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  downloadJson,
  encryptSecretKey,
  passwordStrengthHint,
} from "@/lib/encryption";
import { copyText, shortAddress } from "@/lib/utils";

export function BackupPanel({
  publicKey,
  secretKey,
}: {
  publicKey: string;
  secretKey: string;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const strength = passwordStrengthHint(password);

  const onDownload = async () => {
    if (password.length < 8) {
      toast.error("Use at least 8 characters — prefer a 4+ word passphrase");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!strength.ok) {
      toast.message("Consider a longer passphrase before storing large balances");
    }

    setBusy(true);
    try {
      const backup = await encryptSecretKey({
        secretKeyBase58: secretKey,
        publicKey,
        password,
      });
      downloadJson(`shipx402-${shortAddress(publicKey, 6)}.enc.json`, backup);
      toast.success("Encrypted backup downloaded — write down the password too");
      setPassword("");
      setConfirm("");
    } catch {
      toast.error("Encryption failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="size-5 text-warn" />
            What you should already have written
          </CardTitle>
          <CardDescription>
            These are your real “install” credentials for any phone or computer.
          </CardDescription>
        </CardHeader>
        <ol className="space-y-3 text-base text-muted">
          <li className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <strong className="text-fg">Public address</strong> — share to receive.
            <div className="mt-2 flex gap-2">
              <code className="block flex-1 break-all font-mono text-xs text-fg">
                {publicKey}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await copyText(publicKey);
                  toast.success("Address copied");
                }}
              >
                Copy
              </Button>
            </div>
          </li>
          <li className="rounded-[var(--radius-md)] border border-warn/30 bg-warn-bg p-3">
            <strong className="text-fg">Private key (base58)</strong> — never share.
            Phantom/Solflare can import this format if you move later. Prefer writing it
            down over relying on clipboard history.
          </li>
          <li className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <strong className="text-fg">Optional: backup password + .enc.json</strong> —
            easier restore without pasting the raw key.
          </li>
        </ol>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5 text-primary" />
            Download encrypted backup
          </CardTitle>
          <CardDescription>
            PBKDF2 (600k iterations) + AES-256-GCM. Prefer a 4+ word random passphrase.
          </CardDescription>
        </CardHeader>

        <div className="space-y-3">
          <div>
            <Label>Password (write this down)</Label>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. four unique words together"
            />
            {password.length > 0 && (
              <p
                className={`mt-1.5 text-sm ${strength.ok ? "text-success" : "text-warn"}`}
              >
                {strength.label}
              </p>
            )}
          </div>
          <div>
            <Label>Confirm password</Label>
            <Input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <div className="rounded-[var(--radius-md)] border border-warn/25 bg-warn-bg p-3 text-sm text-warn">
            If you forget this password, the backup file cannot be opened. Keep private
            key notes as ultimate recovery.
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={busy}
            onClick={() => void onDownload()}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Download encrypted file
          </Button>
        </div>
      </Card>
    </div>
  );
}
