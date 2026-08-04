import { useMemo, useState } from "react";
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

    const push = (entry: LabLog) =>
      setLogs((prev) => [...prev, entry]);

    try {
      // Step 1–2: request without payment
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
        detail: "HTTP 402 with machine-readable accepts[] (price, network, payTo, scheme).",
        status: unpaid.status,
        body: unpaidJson,
      });
      setLiveStep(2);
      await delay(450);

      if (unpaid.status !== 402) {
        toast.error(`Expected 402, got ${unpaid.status}`);
        return;
      }

      const accept = unpaidJson.accepts[0];
      if (!accept) {
        toast.error("No payment options in 402 body");
        return;
      }

      // Step 3: sign payment with local wallet
      setLiveStep(3);
      push({
        step: 3,
        label: "Build & sign payment",
        detail: `Wallet ${shortAddress(publicKey)} signs lab payment intent for ${accept.maxAmountRequired} units.`,
      });
      await delay(400);

      const paymentProof = signLabPayment({
        secretKeyBase58: secretKey,
        resource: accept.resource,
        amount: accept.maxAmountRequired,
        network: accept.network,
      });
      setProof(paymentProof);
      const header = encodeXPaymentHeader(paymentProof);
      push({
        step: 3,
        label: "X-PAYMENT header ready",
        detail: `Base64 payment proof (${header.slice(0, 28)}…), scheme=${paymentProof.scheme}`,
        body: paymentProof,
      });
      await delay(400);

      // Step 4–5: retry with proof
      setLiveStep(4);
      push({
        step: 4,
        label: "Retry with payment proof",
        detail: `GET ${X402_RESOURCE_PATH} + header X-PAYMENT`,
      });
      await delay(350);

      const paid = await fetch(X402_RESOURCE_PATH, {
        method: "GET",
        headers: {
          "X-PAYMENT": header,
        },
      });
      const paidJson = (await paid.json()) as {
        fact?: string;
        payment?: unknown;
        error?: string;
        reason?: string;
      };

      setLiveStep(5);
      if (!paid.ok) {
        push({
          step: 5,
          label: "Verification failed",
          detail: paidJson.reason ?? paidJson.error ?? "Unknown error",
          status: paid.status,
          body: paidJson,
        });
        toast.error("Payment not accepted");
        return;
      }

      setResult({
        fact: paidJson.fact ?? "Unlocked!",
        payment: paidJson.payment,
      });
      push({
        step: 5,
        label: "200 OK — resource delivered",
        detail: "Server verified your signed intent and returned premium content.",
        status: paid.status,
        body: paidJson,
      });
      toast.success("x402 lab payment succeeded");
      setLiveStep(6);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lab run failed";
      toast.error(msg);
      push({ step: 0, label: "Error", detail: msg });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">x402 Lab</h2>
            <Badge variant="learn">Tutorial + live demo</Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted">
            x402 turns HTTP <strong className="text-fg">402 Payment Required</strong> into
            a standard way for APIs (and AI agents) to charge per request with crypto —
            usually stablecoins — without accounts or API keys.
          </p>
        </div>
        <Button onClick={() => void runLab()} disabled={running}>
          {running ? (
            <Loader2 className="size-4 animate-spin" />
          ) : result ? (
            <RefreshCw className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
          {running ? "Running flow…" : result ? "Run lab again" : "Run live x402 flow"}
        </Button>
      </div>

      {/* Why it exists */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="mb-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="size-4 text-primary" />
            Why x402 exists (simple)
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted">
            The web is great at moving <em>information</em>, but bad at moving{" "}
            <em>tiny amounts of money</em> without signups, cards, and monthly plans.
            x402 says: when something costs money, reply with <strong>402</strong> and a
            price tag machines understand. The client pays (often USDC on Solana or Base)
            and retries. That unlocks pay-per-API-call and agent commerce without building
            a whole billing product.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Roles */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((r) => (
          <div
            key={r.title}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-4"
          >
            <r.icon className="mb-2 size-4 text-primary" />
            <div className="text-sm font-medium text-fg">{r.title}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted">{r.body}</p>
          </div>
        ))}
      </div>

      {/* Step tutorial */}
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="space-y-1">
          {X402_TUTORIAL_STEPS.map((s, i) => {
            const done = liveStep > s.id || (liveStep === 6 && s.id <= 5);
            const current = liveStep === s.id || (liveStep === 0 && i === activeLesson);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveLesson(i)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors",
                  activeLesson === i
                    ? "border-primary/40 bg-surface-2"
                    : "border-transparent hover:bg-surface",
                )}
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                ) : current && liveStep > 0 ? (
                  <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-subtle" />
                )}
                <span>
                  <span className="block text-xs font-medium text-fg">
                    Step {s.id}
                  </span>
                  <span className="block text-xs text-muted">{s.title}</span>
                </span>
              </button>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Step {lesson.id}: {lesson.title}
            </CardTitle>
            <CardDescription>{lesson.plain}</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-subtle">
                Why this step
              </div>
              <p className="mt-1 text-sm text-muted">{lesson.why}</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-subtle">
                Technical note
              </div>
              <p className="mt-1 font-mono text-xs text-fg">{lesson.technical}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={activeLesson === 0}
                onClick={() => setActiveLesson((v) => Math.max(0, v - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={activeLesson >= X402_TUTORIAL_STEPS.length - 1}
                onClick={() =>
                  setActiveLesson((v) =>
                    Math.min(X402_TUTORIAL_STEPS.length - 1, v + 1),
                  )
                }
              >
                Next step
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Live run output */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="size-4 text-primary" />
              Live protocol log
            </CardTitle>
            <CardDescription>
              Hits the real lab endpoint in this app. Uses your wallet to sign the lab
              payment intent (amount {X402_LAB_AMOUNT} units).
            </CardDescription>
          </CardHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {logs.length === 0 && (
              <p className="text-sm text-muted">
                Press <strong className="text-fg">Run live x402 flow</strong> to watch
                402 → sign → retry → 200.
              </p>
            )}
            {logs.map((log, i) => (
              <div
                key={`${log.step}-${i}`}
                className="rounded-[var(--radius-md)] border border-border bg-bg p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-fg">
                    {log.step > 0 ? `Step ${log.step} · ` : ""}
                    {log.label}
                  </span>
                  {log.status !== undefined && (
                    <Badge
                      variant={
                        log.status === 200
                          ? "success"
                          : log.status === 402
                            ? "warn"
                            : "default"
                      }
                    >
                      HTTP {log.status}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted">{log.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" />
              What you unlocked
            </CardTitle>
            <CardDescription>
              After a valid payment proof, the server returns the paid resource.
            </CardDescription>
          </CardHeader>

          {!result && !requirements && (
            <p className="text-sm text-muted">
              Run the lab to see the 402 challenge, your signed proof, and the premium
              response.
            </p>
          )}

          {requirements && (
            <div className="mb-3 space-y-2">
              <div className="text-xs font-medium text-muted">402 requirements (excerpt)</div>
              <pre className="max-h-40 overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-[10px] leading-relaxed text-muted">
                {JSON.stringify(
                  {
                    error: requirements.error,
                    accepts: requirements.accepts.map((a) => ({
                      scheme: a.scheme,
                      network: a.network,
                      maxAmountRequired: a.maxAmountRequired,
                      payTo: a.payTo,
                      asset: a.asset,
                      description: a.description,
                    })),
                    why: requirements.why,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}

          {proof && (
            <div className="mb-3 space-y-2">
              <div className="text-xs font-medium text-muted">Your payment proof</div>
              <pre className="max-h-36 overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-[10px] leading-relaxed text-muted">
                {JSON.stringify(
                  {
                    ...proof,
                    payload: {
                      ...proof.payload,
                      signature: `${proof.payload.signature.slice(0, 20)}…`,
                    },
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}

          {result && (
            <div className="rounded-[var(--radius-lg)] border border-success/30 bg-success-bg p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-success">
                Premium resource
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fg">{result.fact}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Lab vs production */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lab mode vs production x402</CardTitle>
          <CardDescription>
            Same request loop — different settlement backend.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="py-2 pr-3 font-medium">Piece</th>
                <th className="py-2 pr-3 font-medium">This lab</th>
                <th className="py-2 font-medium">Production (typical)</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-border/70">
                <td className="py-2.5 pr-3 text-fg">Challenge</td>
                <td className="py-2.5 pr-3">HTTP 402 + JSON accepts[]</td>
                <td className="py-2.5">HTTP 402 + PAYMENT-REQUIRED / body</td>
              </tr>
              <tr className="border-b border-border/70">
                <td className="py-2.5 pr-3 text-fg">Asset</td>
                <td className="py-2.5 pr-3">Lab units (signed intent)</td>
                <td className="py-2.5">USDC on Solana / Base / etc.</td>
              </tr>
              <tr className="border-b border-border/70">
                <td className="py-2.5 pr-3 text-fg">Client proof</td>
                <td className="py-2.5 pr-3">X-PAYMENT with ed25519 signature</td>
                <td className="py-2.5">
                  X-PAYMENT or PAYMENT-SIGNATURE (signed transfer / authorization)
                </td>
              </tr>
              <tr className="border-b border-border/70">
                <td className="py-2.5 pr-3 text-fg">Settlement</td>
                <td className="py-2.5 pr-3">Server verifies signature only</td>
                <td className="py-2.5">On-chain transfer + optional facilitator</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-3 text-fg">Your wallet role</td>
                <td className="py-2.5 pr-3">Signer for the lab intent</td>
                <td className="py-2.5">
                  Same keys can power a real Solana x402 client later
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-subtle">
          Spec & ecosystem:{" "}
          <a
            className="link-readable"
            href="https://www.x402.org/"
            target="_blank"
            rel="noreferrer"
          >
            x402.org
          </a>
          {" · "}
          <a
            className="link-readable"
            href="https://solana.com/docs/payments/agentic-payments/intro-to-x402"
            target="_blank"
            rel="noreferrer"
          >
            Solana x402 intro
          </a>
          {" · "}
          <a
            className="link-readable"
            href="https://docs.cdp.coinbase.com/x402/welcome"
            target="_blank"
            rel="noreferrer"
          >
            Coinbase x402 docs
          </a>
        </p>
      </Card>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
