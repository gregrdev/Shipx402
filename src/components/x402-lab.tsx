import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  FlaskConical,
  Loader2,
  Play,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X402_LAB_AMOUNT,
  X402_RESOURCE_PATH,
  X402_TUTORIAL_STEPS,
  encodeXPaymentHeader,
  signLabPayment,
  type X402PaymentProof,
  type X402PaymentRequirements,
} from "@/lib/x402";
import { cn, shortAddress } from "@/lib/utils";

type LabLog = {
  step: number;
  label: string;
  detail: string;
  status?: number;
  body?: unknown;
};

function acceptAmount(a: { amount?: string; maxAmountRequired?: string }) {
  return a.amount ?? a.maxAmountRequired ?? X402_LAB_AMOUNT;
}

export function X402Lab({
  publicKey,
  secretKey,
}: {
  publicKey: string;
  secretKey: string;
}) {
  const [activeLesson, setActiveLesson] = useState(0);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LabLog[]>([]);
  const [requirements, setRequirements] =
    useState<X402PaymentRequirements | null>(null);
  const [proof, setProof] = useState<X402PaymentProof | null>(null);
  const [result, setResult] = useState<{
    fact: string;
    payment: unknown;
  } | null>(null);
  const [liveStep, setLiveStep] = useState(0);

  const lesson = X402_TUTORIAL_STEPS[activeLesson]!;

  const roles = useMemo(
    () => [
      {
        icon: Wallet,
        title: "You (client)",
        body: "Request a resource and sign payments with your Ship x402 keys.",
      },
      {
        icon: Server,
        title: "Resource server",
        body: "Owns the API. Answers 402 with a price, then unlocks content after payment proof.",
      },
      {
        icon: Shield,
        title: "Facilitator (optional)",
        body: "In production, verifies & settles on-chain so sellers don't run full chain ops. This lab verifies signatures itself.",
      },
      {
        icon: Bot,
        title: "AI agents",
        body: "Same loop as you — discover price, pay stablecoins, continue the task. No human signup form.",
      },
    ],
    [],
  );

  const runLab = async () => {
    setRunning(true);
    setLogs([]);
    setRequirements(null);
    setProof(null);
    setResult(null);
    setLiveStep(1);

    const push = (entry: LabLog) => setLogs((prev) => [...prev, entry]);

    try {
      push({
        step: 1,
        label: "Request protected resource",
        detail: `GET ${X402_RESOURCE_PATH} (no payment header)`,
      });
      setLiveStep(1);
      await delay(350);

      const unpaid = await fetch(X402_RESOURCE_PATH, { method: "GET" });
      const unpaidJson = (await unpaid.json()) as X402PaymentRequirements;
      setRequirements(unpaidJson);
      push({
        step: 2,
        label: "Server returned Payment Required",
        detail:
          "HTTP 402 with v2 envelope (top-level resource, CAIP-2 network, amount) + legacy mirrors.",
        status: unpaid.status,
        body: unpaidJson,
      });
      setLiveStep(2);
      await delay(450);

      const accept = unpaidJson.accepts[0];
      if (!accept) throw new Error("No accepts[] in 402 body");
      const amount = acceptAmount(accept);

      push({
        step: 3,
        label: "Sign payment intent",
        detail: `Wallet ${shortAddress(publicKey)} signs lab payment intent for ${amount} units on ${accept.network}.`,
      });
      setLiveStep(3);
      await delay(400);

      const signed = signLabPayment({
        secretKeyBase58: secretKey,
        resource: X402_RESOURCE_PATH,
        amount,
        network: accept.network,
        payTo: accept.payTo,
      });
      setProof(signed);
      const paymentHeader = encodeXPaymentHeader(signed);

      push({
        step: 4,
        label: "Retry with proof",
        detail: "GET same URL with X-PAYMENT + PAYMENT-SIGNATURE headers (base64 proof).",
      });
      setLiveStep(4);
      await delay(350);

      const paid = await fetch(X402_RESOURCE_PATH, {
        method: "GET",
        headers: {
          "X-PAYMENT": paymentHeader,
          "PAYMENT-SIGNATURE": paymentHeader,
        },
      });
      const paidJson = (await paid.json()) as {
        ok?: boolean;
        fact?: string;
        payment?: unknown;
        error?: string;
        reason?: string;
      };

      if (!paid.ok || !paidJson.ok) {
        throw new Error(
          paidJson.reason || paidJson.error || `Unlock failed (${paid.status})`,
        );
      }

      setResult({
        fact: paidJson.fact ?? "Unlocked.",
        payment: paidJson.payment,
      });
      push({
        step: 5,
        label: "Resource unlocked",
        detail: "HTTP 200 + premium fact. Replay protection: reusing the same nonce fails.",
        status: paid.status,
        body: paidJson,
      });
      setLiveStep(5);
      toast.success("Lab complete — you paid, then unlocked");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lab failed";
      push({
        step: liveStep || 1,
        label: "Error",
        detail: message,
      });
      toast.error(message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="hearth-panel border-primary/25">
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-primary/15 text-primary">
            <FlaskConical className="size-5" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">x402 Lab</CardTitle>
            <Badge variant="learn">v2 envelope</Badge>
          </div>
          <CardDescription className="text-base leading-relaxed">
            Run the full loop with your practice wallet: 402 challenge (CAIP-2 +
            top-level resource), signed intent, retry, unlock. No real money moves.
          </CardDescription>
        </CardHeader>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => (
            <div
              key={r.title}
              className="rounded-[var(--radius-md)] border border-border bg-bg/50 p-3"
            >
              <r.icon className="mb-2 size-4 text-primary" />
              <div className="text-sm font-medium text-fg">{r.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={runLab} disabled={running}>
            {running ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play className="size-4" />
                Run live lab
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            disabled={running}
            onClick={() => {
              setLogs([]);
              setRequirements(null);
              setProof(null);
              setResult(null);
              setLiveStep(0);
            }}
          >
            <RefreshCw className="size-4" />
            Reset
          </Button>
          <span className="text-sm text-subtle">
            Wallet {shortAddress(publicKey)} · lab units only
          </span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lesson cards</CardTitle>
            <CardDescription>Tap a step. Run the lab to see it live.</CardDescription>
          </CardHeader>
          <ol className="space-y-2">
            {X402_TUTORIAL_STEPS.map((step, i) => {
              const done = liveStep > step.id || (result && step.id <= 5);
              const active = liveStep === step.id || activeLesson === i;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setActiveLesson(i)}
                    className={cn(
                      "flex w-full gap-3 rounded-[var(--radius-md)] border p-3 text-left transition-colors",
                      active
                        ? "border-primary/40 bg-primary/10"
                        : "border-border bg-bg/40 hover:border-border-strong",
                    )}
                  >
                    <span className="mt-0.5">
                      {done ? (
                        <CheckCircle2 className="size-5 text-success" />
                      ) : active ? (
                        <Zap className="size-5 text-primary" />
                      ) : (
                        <Circle className="size-5 text-subtle" />
                      )}
                    </span>
                    <span>
                      <span className="font-medium text-fg">
                        {step.id}. {step.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {step.plain}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 rounded-[var(--radius-md)] border border-border bg-surface-2/40 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Why this step
            </div>
            <p className="mt-1 text-sm text-muted">{lesson.why}</p>
            <p className="mt-2 font-mono text-xs text-subtle">{lesson.technical}</p>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live log</CardTitle>
            <CardDescription>Request / response trail for this run.</CardDescription>
          </CardHeader>
          <div className="max-h-[28rem] space-y-2 overflow-y-auto font-mono text-xs">
            {logs.length === 0 && (
              <p className="text-sm text-subtle">
                Press “Run live lab” to capture the 402 → pay → 200 trail.
              </p>
            )}
            {logs.map((log, i) => (
              <div
                key={`${log.step}-${i}`}
                className="rounded-[var(--radius-md)] border border-border bg-bg/60 p-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-fg">
                  <span className="text-primary">#{log.step}</span>
                  <span className="font-medium">{log.label}</span>
                  {log.status != null && (
                    <Badge variant={log.status === 200 ? "default" : "learn"}>
                      {log.status}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-muted">{log.detail}</p>
              </div>
            ))}
          </div>

          {requirements && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-subtle">
                402 accepts[0]
              </div>
              <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 text-[11px] text-muted">
                {JSON.stringify(
                  {
                    x402Version: requirements.x402Version,
                    resource: requirements.resource,
                    accepts: requirements.accepts.map((a) => ({
                      scheme: a.scheme,
                      network: a.network,
                      amount: acceptAmount(a),
                      maxAmountRequired: a.maxAmountRequired,
                      payTo: a.payTo,
                      asset: a.asset,
                    })),
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}

          {proof && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-subtle">
                Signed proof (truncated)
              </div>
              <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 text-[11px] text-muted">
                {JSON.stringify(
                  {
                    x402Version: proof.x402Version,
                    scheme: proof.scheme,
                    network: proof.network,
                    payload: {
                      payer: proof.payload.payer,
                      amount: proof.payload.amount,
                      nonce: proof.payload.nonce,
                      signature: `${proof.payload.signature.slice(0, 16)}…`,
                    },
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-[var(--radius-lg)] border border-success/30 bg-success-bg/40 p-4">
              <div className="flex items-center gap-2 text-success">
                <Sparkles className="size-4" />
                <span className="font-semibold">Unlocked</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fg">{result.fact}</p>
              <div className="mt-3">
                <Link
                  to="/guides/x402-v1-vs-v2"
                  className="link-readable inline-flex items-center gap-1 text-sm font-medium"
                >
                  Read v1 vs v2
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
