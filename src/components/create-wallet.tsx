import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  PenLine,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { generateWallet } from "@/lib/solana";
import { downloadJson, encryptSecretKey } from "@/lib/encryption";
import { copySensitiveText } from "@/lib/security";
import { useWalletStore } from "@/lib/wallet-store";
import { copyText, cn, shortAddress } from "@/lib/utils";

const STEPS = [
  "What to write down",
  "Generate",
  "Save address",
  "Save private key",
  "Backup file",
  "Done",
] as const;

export function CreateWallet() {
  const network = useWalletStore((s) => s.network);
  const setPhase = useWalletStore((s) => s.setPhase);
  const setWallet = useWalletStore((s) => s.setWallet);

  const [step, setStep] = useState(0);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [addrSaved, setAddrSaved] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const [confirmTail, setConfirmTail] = useState("");
  const [ackWrite, setAckWrite] = useState(false);
  const [ackShare, setAckShare] = useState(false);
  const [ackDevice, setAckDevice] = useState(false);
  const [vanityPrefix, setVanityPrefix] = useState("");
  const [grinding, setGrinding] = useState(false);
  const [grindTried, setGrindTried] = useState(0);
  const [backupPassword, setBackupPassword] = useState("");
  const [backupConfirm, setBackupConfirm] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupDone, setBackupDone] = useState(false);

  const isLearn = network === "devnet";

  const secretTail = useMemo(
    () => (secretKey ? secretKey.slice(-6) : ""),
    [secretKey],
  );

  const secretConfirmed =
    !!secretKey && confirmTail.trim() === secretTail;

  const canLeaveSecretStep =
    secretConfirmed && ackWrite && ackShare && ackDevice && !!publicKey && !!secretKey;

  const onGenerate = async (useVanity: boolean) => {
    if (useVanity && vanityPrefix.trim()) {
      const prefix = vanityPrefix.trim().toLowerCase();
      if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(prefix) || prefix.length > 4) {
        toast.error("Use 1–4 base58 characters (no 0, O, I, or l)");
        return;
      }
      setGrinding(true);
      setGrindTried(0);
      try {
        let found: ReturnType<typeof generateWallet> | null = null;
        let tries = 0;
        const maxTries = 150_000;
        while (tries < maxTries && !found) {
          for (let i = 0; i < 500; i++) {
            tries++;
            const w = generateWallet();
            if (w.publicKey.toLowerCase().startsWith(prefix)) {
              found = w;
              break;
            }
          }
          setGrindTried(tries);
          await new Promise((r) => setTimeout(r, 0));
        }
        if (!found) {
          toast.error("No match yet — try a shorter prefix");
          return;
        }
        setPublicKey(found.publicKey);
        setSecretKey(found.secretKey);
        resetSaveState();
        toast.success(`Found vanity address after ${tries.toLocaleString()} tries`);
      } finally {
        setGrinding(false);
      }
      return;
    }

    const w = generateWallet();
    setPublicKey(w.publicKey);
    setSecretKey(w.secretKey);
    resetSaveState();
    toast.success("Wallet created in this browser — nothing was uploaded");
  };

  function resetSaveState() {
    setShowSecret(false);
    setAddrSaved(false);
    setSecretCopied(false);
    setConfirmTail("");
    setAckWrite(false);
    setAckShare(false);
    setAckDevice(false);
    setBackupDone(false);
    setBackupPassword("");
    setBackupConfirm("");
  }

  const downloadBackup = async () => {
    if (!publicKey || !secretKey) return;
    if (backupPassword.length < 8) {
      toast.error("Backup password needs at least 8 characters");
      return;
    }
    if (backupPassword !== backupConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBackupBusy(true);
    try {
      const backup = await encryptSecretKey({
        secretKeyBase58: secretKey,
        publicKey,
        password: backupPassword,
      });
      downloadJson(`shipx402-${shortAddress(publicKey, 6)}.enc.json`, backup);
      setBackupDone(true);
      toast.success("Encrypted backup downloaded — keep password + file together");
      setBackupPassword("");
      setBackupConfirm("");
    } catch {
      toast.error("Could not encrypt backup");
    } finally {
      setBackupBusy(false);
    }
  };

  const finish = () => {
    if (!publicKey || !secretKey || !canLeaveSecretStep) return;
    setWallet(publicKey, secretKey);
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
          Set up your wallet
        </h1>
        <p className="mt-1 text-base text-muted">
          Step {step + 1} of {STEPS.length}:{" "}
          <strong className="text-fg">{STEPS[step]}</strong>
        </p>
        <div className="mt-4 flex gap-1.5">
          {STEPS.map((label, i) => (
            <div
              key={label}
              title={label}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-surface-2",
              )}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <Card className="hearth-panel border-primary/20">
          <CardHeader>
            <CardTitle>Two things you must keep</CardTitle>
            <CardDescription>
              A Solana wallet is not an app-store install — it is a pair of keys. This
              site works in any modern browser (phone, tablet, or computer). Keys are
              created on your device; you carry them everywhere.
            </CardDescription>
          </CardHeader>

          <div className="space-y-3">
            <div className="rounded-[var(--radius-lg)] border border-primary/30 bg-primary/10 p-4">
              <div className="flex items-start gap-3">
                <Share2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <div className="text-base font-semibold text-fg">
                    1. Public address — safe to share
                  </div>
                  <p className="mt-1 text-base text-muted">
                    Like an email or account number. People use it (or your QR) to send
                    you money. Save it in notes or contacts.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-warn/35 bg-warn-bg p-4">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 size-5 shrink-0 text-warn" />
                <div>
                  <div className="text-base font-semibold text-fg">
                    2. Private key — never share
                  </div>
                  <p className="mt-1 text-base text-muted">
                    Whoever has this string can spend your funds. Write it offline
                    (paper, password manager, encrypted file). We{" "}
                    <strong className="text-fg">cannot</strong> reset or email it. Never
                    paste it into chat or an AI conversation.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-border bg-bg p-4">
              <div className="flex items-start gap-3">
                <Smartphone className="mt-0.5 size-5 shrink-0 text-ember" />
                <div>
                  <div className="text-base font-semibold text-fg">
                    3. Another phone or computer
                  </div>
                  <p className="mt-1 text-base text-muted">
                    Open this site → <strong className="text-fg">Open existing wallet</strong>{" "}
                    → paste private key or upload encrypted backup + password. Prefer the
                    encrypted file when you can.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-md)] border border-border bg-surface-2/50 p-3 text-sm text-muted sm:text-base">
              <strong className="text-fg">Session note:</strong> closing the tab, idle
              timeout, or locking clears the unlocked key from memory. Your written key /
              backup is how you get back in.
            </div>
          </div>

          <Button className="mt-5 w-full" size="lg" onClick={() => setStep(1)}>
            I understand — create keys
            <ChevronRight className="size-4" />
          </Button>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Generate keys in this browser</CardTitle>
            <CardDescription>
              Happens on your device only. After this you will write down both values.
            </CardDescription>
          </CardHeader>

          {!publicKey ? (
            <div className="space-y-4">
              <Button
                className="w-full"
                size="lg"
                disabled={grinding}
                onClick={() => void onGenerate(false)}
              >
                {grinding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}
                Generate my wallet
              </Button>

              <div className="rounded-[var(--radius-lg)] border border-border bg-bg p-4">
                <div className="mb-2 flex items-center gap-2 text-base font-medium text-fg">
                  <Sparkles className="size-4 text-primary" />
                  Optional vanity prefix
                </div>
                <p className="mb-3 text-sm text-muted">
                  Address starts with letters you choose (1–4 chars). Skip if you are new.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="e.g. ez"
                    value={vanityPrefix}
                    onChange={(e) => setVanityPrefix(e.target.value)}
                    maxLength={4}
                    className="font-mono"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <Button
                    variant="secondary"
                    disabled={grinding || !vanityPrefix.trim()}
                    onClick={() => void onGenerate(true)}
                  >
                    {grinding ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {grindTried.toLocaleString()}…
                      </>
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-[var(--radius-md)] border border-success/30 bg-success-bg p-4 text-base text-success">
                Keys ready. Next: save your <strong>public address</strong>.
              </div>
              <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
                <div className="text-xs uppercase tracking-wide text-subtle">
                  Preview (full save next)
                </div>
                <div className="mt-1 break-all font-mono text-sm text-fg">{publicKey}</div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setPublicKey(null);
                    setSecretKey(null);
                    resetSaveState();
                  }}
                >
                  Generate a different one
                </Button>
                <Button className="flex-1" onClick={() => setStep(2)}>
                  Write down address
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {step === 2 && publicKey && (
        <Card>
          <CardHeader>
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-primary">
              <PenLine className="size-4" />
              WRITE THIS DOWN · piece 1 of 2
            </div>
            <CardTitle>Your public address</CardTitle>
            <CardDescription>
              Safe to share for receiving. Copy it or write it by hand, then confirm.
            </CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <div className="rounded-[var(--radius-lg)] border-2 border-primary/40 bg-bg p-4">
              <Label className="text-primary">Public address</Label>
              <p className="mt-2 break-all font-mono text-sm leading-relaxed text-fg sm:text-base">
                {publicKey}
              </p>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={async () => {
                try {
                  await copyText(publicKey);
                  setAddrSaved(true);
                  toast.success("Address copied — paste into a safe note");
                } catch {
                  toast.message(
                    "Copy blocked — write the address by hand, then check the box",
                  );
                }
              }}
            >
              <Copy className="size-4" />
              Copy address
            </Button>

            <label className="flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-border bg-bg p-3.5">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={addrSaved}
                onChange={(e) => setAddrSaved(e.target.checked)}
              />
              <span className="text-base text-muted">
                I saved this public address outside the app (notes, contacts, or paper).
              </span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!addrSaved}
                onClick={() => setStep(3)}
              >
                Address saved — next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && publicKey && secretKey && (
        <Card className="border-warn/30">
          <CardHeader>
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-warn">
              <AlertTriangle className="size-4" />
              WRITE THIS DOWN · piece 2 of 2 · SECRET
            </div>
            <CardTitle>Your private key</CardTitle>
            <CardDescription>
              This is the only recovery. If you lose it, funds are gone. Never paste into
              chat or AI tools.
            </CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <div className="rounded-[var(--radius-lg)] border-2 border-warn/40 bg-warn-bg/40 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Label className="mb-0 text-warn">Private key (base58)</Label>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
                  onClick={() => setShowSecret((v) => !v)}
                >
                  {showSecret ? (
                    <>
                      <EyeOff className="size-4" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="size-4" /> Reveal to write down
                    </>
                  )}
                </button>
              </div>
              <p
                data-testid="private-key-value"
                className={cn(
                  "break-all font-mono text-sm leading-relaxed sm:text-base",
                  showSecret ? "text-fg select-all" : "text-subtle",
                )}
              >
                {showSecret
                  ? secretKey
                  : "••••••••••••••••••••••••••••••••••••••••••••••••"}
              </p>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              disabled={!showSecret}
              onClick={async () => {
                try {
                  await copySensitiveText(secretKey);
                  setSecretCopied(true);
                  toast.success(
                    "Copied for password manager only. Clipboard may stay in history managers; write-down/backup is safer.",
                  );
                } catch {
                  toast.message("Copy blocked — write the key carefully by hand");
                }
              }}
            >
              <Copy className="size-4" />
              {secretCopied ? "Copied (best-effort clear)" : "Copy private key"}
            </Button>

            <div>
              <Label>Confirm you can read your notes — type the last 6 characters</Label>
              <Input
                className="font-mono text-base tracking-widest"
                placeholder="······"
                value={confirmTail}
                onChange={(e) => setConfirmTail(e.target.value.trim())}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                maxLength={6}
              />
              <p className="mt-1 text-xs text-subtle">
                Base58 is case-sensitive — match the last 6 characters exactly.
              </p>
              {confirmTail.length > 0 && (
                <p
                  className={cn(
                    "mt-1.5 text-sm",
                    secretConfirmed ? "text-success" : "text-danger",
                  )}
                >
                  {secretConfirmed
                    ? "Match — good, you can read your saved key."
                    : "Doesn’t match yet. Check your notes carefully."}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-border bg-bg p-3.5">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={ackWrite}
                onChange={(e) => setAckWrite(e.target.checked)}
              />
              <span className="text-base text-muted">
                I wrote the full private key somewhere I control. Ship x402 cannot
                recover it.
              </span>
            </label>

            <label className="flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-border bg-bg p-3.5">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={ackShare}
                onChange={(e) => setAckShare(e.target.checked)}
              />
              <span className="text-base text-muted">
                I will never share this key in chat, email, Discord, or AI chats, or paste
                it into random “support / airdrop” sites.
              </span>
            </label>

            <label className="flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-border bg-bg p-3.5">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={ackDevice}
                onChange={(e) => setAckDevice(e.target.checked)}
              />
              <span className="text-base text-muted">
                I understand sessions auto-lock and closing the tab clears memory — I
                re-import with key or backup on any device.
              </span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!canLeaveSecretStep}
                onClick={() => setStep(4)}
              >
                Continue to backup
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 4 && publicKey && secretKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              Encrypted backup file (recommended)
            </CardTitle>
            <CardDescription>
              Best multi-device path: password-protected file instead of pasting a raw key
              on every phone.
            </CardDescription>
          </CardHeader>

          <div className="space-y-3">
            <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3 text-sm text-muted sm:text-base">
              <code className="text-fg">.enc.json</code> locked with PBKDF2 (600k) +
              AES-256-GCM. Write the password down separately.
            </div>

            <div>
              <Label>Backup password (write this down)</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <Label>Confirm password</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={backupConfirm}
                onChange={(e) => setBackupConfirm(e.target.value)}
              />
            </div>

            <div className="rounded-[var(--radius-md)] border border-warn/25 bg-warn-bg p-3 text-sm text-warn">
              If you forget the password, the file is useless — private key notes are the
              fallback.
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={backupBusy}
              onClick={() => void downloadBackup()}
            >
              {backupBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {backupDone ? "Download again" : "Download encrypted backup"}
            </Button>

            {backupDone && (
              <div className="rounded-[var(--radius-md)] border border-success/30 bg-success-bg p-3 text-sm text-success">
                Backup file saved.
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(3)}>
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(5)}>
                {backupDone ? "Finish setup" : "Skip for now"}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 5 && publicKey && (
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="size-6" />
            </div>
            <CardTitle>You're set — quick recap</CardTitle>
            <CardDescription>
              {isLearn
                ? "Next: airdrop free Devnet SOL, then try Receive, Send, x402, and Agents."
                : "Next: fund carefully from an exchange (small test first)."}
            </CardDescription>
          </CardHeader>

          <div className="mb-4 space-y-2">
            <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
              <div className="text-xs uppercase tracking-wide text-subtle">
                Address you can share
              </div>
              <div className="mt-1 break-all font-mono text-sm text-fg">{publicKey}</div>
            </div>
            <ul className="space-y-2 text-base text-muted">
              <li className="flex gap-2">
                <Check className="mt-1 size-4 shrink-0 text-success" />
                Private key written down offline
              </li>
              <li className="flex gap-2">
                <Check className="mt-1 size-4 shrink-0 text-success" />
                {backupDone
                  ? "Encrypted backup file downloaded"
                  : "Backup skipped — private key is recovery"}
              </li>
              <li className="flex gap-2">
                <Check className="mt-1 size-4 shrink-0 text-success" />
                Any device: “Open existing wallet” with key or backup
              </li>
            </ul>
          </div>

          <Button className="w-full" size="lg" onClick={finish}>
            Open wallet dashboard
            <ChevronRight className="size-4" />
          </Button>
        </Card>
      )}
    </div>
  );
}
