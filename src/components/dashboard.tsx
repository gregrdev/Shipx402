import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Bot,
  Droplets,
  FlaskConical,
  Heart,
  Info,
  Loader2,
  LogOut,
  QrCode,
  RefreshCw,
  Send,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceivePanel } from "@/components/receive-panel";
import { SendPanel } from "@/components/send-panel";
import { BackupPanel } from "@/components/backup-panel";
import { LearnPanel } from "@/components/learn-panel";
import { X402Lab } from "@/components/x402-lab";
import { AgentsPanel } from "@/components/agents-panel";
import { DonatePanel } from "@/components/donate-panel";
import { SecurityPanel } from "@/components/security-panel";
import { getBalanceSol, requestDevnetAirdrop } from "@/lib/solana";
import { IDLE_LOCK_MS } from "@/lib/security";
import { useWalletStore } from "@/lib/wallet-store";
import { copyText, shortAddress } from "@/lib/utils";

export function Dashboard() {
  const publicKey = useWalletStore((s) => s.publicKey);
  const secretKey = useWalletStore((s) => s.secretKey);
  const network = useWalletStore((s) => s.network);
  const setNetwork = useWalletStore((s) => s.setNetwork);
  const clearWallet = useWalletStore((s) => s.clearWallet);

  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBal, setLoadingBal] = useState(false);
  const [airdropping, setAirdropping] = useState(false);
  const [tab, setTab] = useState("receive");
  const idleTimer = useRef<number | null>(null);

  const lock = useCallback(
    (reason?: string) => {
      clearWallet();
      if (reason) toast.message(reason);
    },
    [clearWallet],
  );

  const bumpIdle = useCallback(() => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      lock("Wallet locked after idle time for safety");
    }, IDLE_LOCK_MS);
  }, [lock]);

  useEffect(() => {
    bumpIdle();
    const onActivity = () => bumpIdle();
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    for (const e of events) window.addEventListener(e, onActivity, { passive: true });

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        // Lock if tab stays backgrounded for half the idle window
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => {
          if (document.visibilityState === "hidden") {
            lock("Wallet locked while tab was in the background");
          }
        }, IDLE_LOCK_MS / 2);
      } else {
        bumpIdle();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      for (const e of events) window.removeEventListener(e, onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [bumpIdle, lock]);

  // Only warn on tab close when there is a non-zero balance (auto-lock covers secrets)
  useEffect(() => {
    if (balance === null || balance <= 0) return;
    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [balance]);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    setLoadingBal(true);
    try {
      const sol = await getBalanceSol(publicKey, network);
      setBalance(sol);
    } catch {
      toast.error("Could not fetch balance");
    } finally {
      setLoadingBal(false);
    }
  }, [publicKey, network]);

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

  if (!publicKey || !secretKey) {
    return (
      <div className="text-center text-base text-muted">
        Wallet session missing. Use Open existing wallet on the home page.
      </div>
    );
  }

  const isLearn = network === "devnet";

  const onAirdrop = async () => {
    setAirdropping(true);
    try {
      await requestDevnetAirdrop(publicKey, 1);
      toast.success("Airdropped 1 Devnet SOL");
      await refreshBalance();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Airdrop failed";
      toast.error(
        msg.includes("429") || msg.toLowerCase().includes("airdrop")
          ? "Airdrop rate-limited. Try again in a minute or use faucet.solana.com"
          : msg,
      );
    } finally {
      setAirdropping(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Your wallet
            </h1>
            <Badge variant={isLearn ? "learn" : "real"}>
              {isLearn ? "Learn · Devnet" : "Real · Mainnet"}
            </Badge>
          </div>
          <button
            type="button"
            className="font-mono text-sm text-muted hover:text-fg"
            title="Copy full address"
            onClick={async () => {
              await copyText(publicKey);
              toast.success("Address copied");
            }}
          >
            {shortAddress(publicKey, 6)} · tap to copy
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex overflow-hidden rounded-[var(--radius-md)] border border-border">
            <button
              type="button"
              className={`px-3 py-2.5 text-sm font-medium ${
                isLearn ? "bg-learn-bg text-learn" : "bg-bg text-muted hover:text-fg"
              }`}
              onClick={() => setNetwork("devnet")}
            >
              Learn
            </button>
            <button
              type="button"
              className={`px-3 py-2.5 text-sm font-medium ${
                !isLearn ? "bg-real-bg text-real" : "bg-bg text-muted hover:text-fg"
              }`}
              onClick={() => {
                setNetwork("mainnet-beta");
                toast.message("Real mode: only use funds you can afford to risk");
              }}
            >
              Real
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => lock("Wallet locked — re-open with key or backup")}
          >
            <LogOut className="size-4" />
            Lock
          </Button>
        </div>
      </div>

      <div className="flex gap-3 rounded-[var(--radius-lg)] border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-muted sm:text-base">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          <strong className="text-fg">Session security:</strong> keys stay in this tab’s
          memory only, auto-lock on idle/background, and never sync across devices. Move
          with your written key or encrypted backup — see{" "}
          <button
            type="button"
            className="link-readable font-medium"
            onClick={() => setTab("security")}
          >
            Safety
          </button>
          .
        </p>
      </div>

      {!isLearn && (
        <div className="flex gap-3 rounded-[var(--radius-lg)] border border-real/35 bg-real-bg px-4 py-3 text-sm text-real sm:text-base">
          <Shield className="mt-0.5 size-4 shrink-0" />
          <p>
            <strong>Mainnet:</strong> browser wallets are convenient but not vaults. Keep
            balances modest; use a hardware wallet for larger amounts.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:col-span-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">
            Balance
          </div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-3xl font-semibold tabular-nums text-fg sm:text-4xl">
              {balance === null ? "—" : balance.toFixed(4)}
            </span>
            <span className="mb-1 text-base text-muted">SOL</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-10"
              onClick={() => void refreshBalance()}
              disabled={loadingBal}
              aria-label="Refresh balance"
            >
              <RefreshCw className={`size-4 ${loadingBal ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          {isLearn ? (
            <>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                Free practice SOL
              </div>
              <Button
                className="mt-3 w-full"
                variant="secondary"
                disabled={airdropping}
                onClick={() => void onAirdrop()}
              >
                {airdropping ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Droplets className="size-4" />
                )}
                Airdrop 1 SOL
              </Button>
            </>
          ) : (
            <>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                Fund wallet
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Withdraw a small test amount from an exchange first.
              </p>
            </>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="receive">
            <QrCode className="mr-1.5 inline size-3.5" />
            Receive
          </TabsTrigger>
          <TabsTrigger value="send">
            <Send className="mr-1.5 inline size-3.5" />
            Send
          </TabsTrigger>
          <TabsTrigger value="x402">
            <FlaskConical className="mr-1.5 inline size-3.5" />
            x402
          </TabsTrigger>
          <TabsTrigger value="donate">
            <Heart className="mr-1.5 inline size-3.5" />
            Donate
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Bot className="mr-1.5 inline size-3.5" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Shield className="mr-1.5 inline size-3.5" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="mr-1.5 inline size-3.5" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="learn">
            <BookOpen className="mr-1.5 inline size-3.5" />
            Learn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receive">
          <ReceivePanel publicKey={publicKey} network={network} />
        </TabsContent>
        <TabsContent value="send">
          <SendPanel
            secretKey={secretKey}
            network={network}
            onSent={() => void refreshBalance()}
          />
        </TabsContent>
        <TabsContent value="x402">
          <X402Lab publicKey={publicKey} secretKey={secretKey} />
        </TabsContent>
        <TabsContent value="donate">
          <DonatePanel />
        </TabsContent>
        <TabsContent value="agents">
          <AgentsPanel />
        </TabsContent>
        <TabsContent value="backup">
          <BackupPanel publicKey={publicKey} secretKey={secretKey} />
        </TabsContent>
        <TabsContent value="security">
          <SecurityPanel />
        </TabsContent>
        <TabsContent value="learn">
          <LearnPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
