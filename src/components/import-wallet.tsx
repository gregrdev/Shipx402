import { useState } from "react";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  FileJson,
  KeyRound,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { decryptSecretKey, type EncryptedBackup } from "@/lib/encryption";
import { isValidSecretKey, walletFromSecret } from "@/lib/solana";
import { useWalletStore } from "@/lib/wallet-store";
import { cn } from "@/lib/utils";

type ImportMode = "key" | "file";

export function ImportWallet() {
  const network = useWalletStore((s) => s.network);
  const setPhase = useWalletStore((s) => s.setPhase);
  const setWallet = useWalletStore((s) => s.setWallet);
  const setNetwork = useWalletStore((s) => s.setNetwork);

  const [mode, setMode] = useState<ImportMode>("key");
  const [secret, setSecret] = useState("");
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [backup, setBackup] = useState<EncryptedBackup | null>(null);
  const [busy, setBusy] = useState(false);

  const isLearn = network === "devnet";

  const openFromSecret = (secretKeyBase58: string) => {
    if (!isValidSecretKey(secretKeyBase58)) {
      toast.error("That doesn’t look like a valid Solana private key");
      return;
    }
    const w = walletFromSecret(secretKeyBase58);
    setWallet(w.publicKey, w.secretKey);
    toast.success("Wallet unlocked in this browser session");
  };

  const onImportKey = () => {
    openFromSecret(secret.trim());
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as EncryptedBackup;
      if (
        parsed.v !== 1 ||
        !parsed.salt ||
        !parsed.iv ||
        !parsed.ciphertext ||
        !parsed.publicKey
      ) {
        toast.error("Not a Ship x402 encrypted backup");
        setBackup(null);
        return;
      }
      setBackup(parsed);
      toast.message("Backup loaded — enter password to unlock");
    } catch {
      toast.error("Could not read that file as JSON backup");
      setBackup(null);
    }
  };

  const onUnlockFile = async () => {
    if (!backup) {
      toast.error("Choose a backup file first");
      return;
    }
    if (!password) {
      toast.error("Enter the backup password");
      return;
    }
    setBusy(true);
    try {
      const secretKey = await decryptSecretKey(backup, password);
      if (!isValidSecretKey(secretKey)) {
        throw new Error("Decrypted data is not a valid key");
      }
      const w = walletFromSecret(secretKey);
      if (w.publicKey !== backup.publicKey) {
        toast.error("Key does not match the address in the backup file");
        return;
      }
      setWallet(w.publicKey, w.secretKey);
      toast.success("Backup unlocked");
    } catch {
      toast.error("Wrong password or damaged backup file");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => setPhase("welcome")}>
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Badge variant={isLearn ? "learn" : "real"}>
          {isLearn ? "Learn · Devnet" : "Real · Mainnet"}
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Open existing wallet
        </h1>
        <p className="mt-1 text-base text-muted">
          Use this on any phone or computer browser. Your key never leaves this device.
          Phantom/Solflare can also import a base58 private key if you prefer those apps
          later.
        </p>
      </div>

      <div className="flex gap-2 rounded-[var(--radius-lg)] border border-border bg-bg p-1.5">
        {(
          [
            { id: "key" as const, label: "Private key", icon: KeyRound },
            { id: "file" as const, label: "Backup file", icon: FileJson },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium sm:text-base",
              mode === tab.id ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex overflow-hidden rounded-[var(--radius-md)] border border-border">
        <button
          type="button"
          className={cn(
            "flex-1 px-3 py-2.5 text-sm font-medium",
            isLearn ? "bg-learn-bg text-learn" : "bg-bg text-muted",
          )}
          onClick={() => setNetwork("devnet")}
        >
          Learn (Devnet)
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 px-3 py-2.5 text-sm font-medium",
            !isLearn ? "bg-real-bg text-real" : "bg-bg text-muted",
          )}
          onClick={() => setNetwork("mainnet-beta")}
        >
          Real (Mainnet)
        </button>
      </div>

      {mode === "key" && (
        <Card>
          <CardHeader>
            <CardTitle>Paste private key</CardTitle>
            <CardDescription>
              The long base58 secret you wrote down. Never paste it into a site you
              don’t trust. Prefer the encrypted backup when possible.
            </CardDescription>
          </CardHeader>
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="mb-0">Private key</Label>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
                  onClick={() => setShow((v) => !v)}
                >
                  {show ? (
                    <>
                      <EyeOff className="size-4" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="size-4" /> Show
                    </>
                  )}
                </button>
              </div>
              {show ? (
                <Textarea
                  className="min-h-[110px] font-mono text-sm"
                  placeholder="Paste base58 private key"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              ) : (
                <Input
                  type="password"
                  className="h-12 font-mono text-sm"
                  placeholder="Paste base58 private key"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              )}
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={!secret.trim()}
              onClick={onImportKey}
            >
              Unlock wallet
            </Button>
          </div>
        </Card>
      )}

      {mode === "file" && (
        <Card>
          <CardHeader>
            <CardTitle>Encrypted backup file</CardTitle>
            <CardDescription>
              Choose the <code className="text-fg">.enc.json</code> file you downloaded
              during setup, then enter the same password.
            </CardDescription>
          </CardHeader>
          <div className="space-y-3">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-bg px-4 py-8 text-center hover:border-primary/40">
              <Upload className="size-6 text-primary" />
              <span className="text-base font-medium text-fg">
                {fileName ?? "Tap to choose backup file"}
              </span>
              <span className="text-sm text-muted">shipx402-….enc.json</span>
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
              />
            </label>

            {backup && (
              <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3 text-sm text-muted">
                File for address{" "}
                <span className="break-all font-mono text-fg">{backup.publicKey}</span>
                {typeof backup.iterations === "number" && (
                  <span className="mt-1 block text-xs text-subtle">
                    PBKDF2 iterations: {backup.iterations.toLocaleString()}
                  </span>
                )}
              </div>
            )}

            <div>
              <Label>Backup password</Label>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password you chose when downloading"
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={busy || !backup}
              onClick={() => void onUnlockFile()}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Unlock from backup
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
