import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Play,
  Shield,
  TerminalSquare,
} from "lucide-react";
import { toast } from "sonner";
import { SupportNudge } from "@/components/support-nudge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  LOOP_PASS_THRESHOLD,
  LOOP_QUIZ,
  makeCertId,
  scoreQuiz,
} from "@/lib/loop-quiz";
import { X402_RESOURCE_PATH } from "@/lib/x402";
import { saveLearnProgress } from "@/lib/learn-progress";
import { cn } from "@/lib/utils";

type StepId = "see" | "read" | "dry" | "quiz" | "cert";

const STEPS: { id: StepId; label: string; blurb: string }[] = [
  {
    id: "see",
    label: "See a 402",
    blurb: "Hit the live lab endpoint and capture Payment Required.",
  },
  {
    id: "read",
    label: "Read the tag",
    blurb: "Find amount, network, asset, and payTo in the body.",
  },
  {
    id: "dry",
    label: "Dry-run",
    blurb: "Walk the client loop without spending real funds.",
  },
  {
    id: "quiz",
    label: "Knowledge check",
    blurb: "Pass the quiz to earn a free certificate.",
  },
  {
    id: "cert",
    label: "Certificate",
    blurb: "Educational completion — not a paid unlock.",
  },
];

export function PaymentLoop() {
  const [step, setStep] = useState<StepId>("see");
  const [busy, setBusy] = useState(false);
  const [labStatus, setLabStatus] = useState<number | null>(null);
  const [labBody, setLabBody] = useState<string | null>(null);
  const [parsed, setParsed] = useState<{
    amount?: string;
    network?: string;
    asset?: string;
    payTo?: string;
    scheme?: string;
    version?: number;
  } | null>(null);
  const [checklist, setChecklist] = useState({
    amount: false,
    network: false,
    asset: false,
    payTo: false,
  });
  const [dryChecks, setDryChecks] = useState({
    request: false,
    pay: false,
    retry: false,
    unlock: false,
  });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [certName, setCertName] = useState("");
  const [cert, setCert] = useState<{
    id: string;
    name: string;
    correct: number;
    total: number;
    date: string;
  } | null>(null);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const score = useMemo(() => scoreQuiz(answers), [answers]);
  const readReady =
    checklist.amount && checklist.network && checklist.asset && checklist.payTo;
  const dryReady =
    dryChecks.request &&
    dryChecks.pay &&
    dryChecks.retry &&
    dryChecks.unlock;

  const fetchLab = async () => {
    setBusy(true);
    setLabBody(null);
    setParsed(null);
    try {
      const res = await fetch(X402_RESOURCE_PATH);
      setLabStatus(res.status);
      const text = await res.text();
      let pretty = text;
      try {
        const json = JSON.parse(text) as Record<string, unknown>;
        pretty = JSON.stringify(json, null, 2);
        const accepts = Array.isArray(json.accepts)
          ? (json.accepts[0] as Record<string, unknown> | undefined)
          : undefined;
        setParsed({
          amount:
            typeof accepts?.amount === "string"
              ? accepts.amount
              : typeof accepts?.maxAmountRequired === "string"
                ? accepts.maxAmountRequired
                : undefined,
          network:
            typeof accepts?.network === "string" ? accepts.network : undefined,
          asset: typeof accepts?.asset === "string" ? accepts.asset : undefined,
          payTo: typeof accepts?.payTo === "string" ? accepts.payTo : undefined,
          scheme:
            typeof accepts?.scheme === "string" ? accepts.scheme : undefined,
          version:
            typeof json.x402Version === "number" ? json.x402Version : undefined,
        });
      } catch {
        /* keep raw */
      }
      setLabBody(pretty);
      if (res.status === 402) {
        saveLearnProgress("/loop", "Walk the Loop");
        toast.success("Got HTTP 402 — payment required");
      } else {
        toast.message(`Unexpected status ${res.status}`);
      }
    } catch {
      toast.error("Could not reach the lab endpoint");
    } finally {
      setBusy(false);
    }
  };

  const issueCert = () => {
    const name = certName.trim() || "Learner";
    if (!score.passed) {
      toast.error(`Need at least ${Math.round(LOOP_PASS_THRESHOLD * 100)}% to pass`);
      return;
    }
    const at = new Date();
    const id = makeCertId(name, score.correct, score.total, at);
    setCert({
      id,
      name,
      correct: score.correct,
      total: score.total,
      date: at.toISOString().slice(0, 10),
    });
    setStep("cert");
    saveLearnProgress("/loop", "Walk the Loop");
    toast.success("Certificate ready — free, educational only");
  };

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <ol className="grid gap-2 sm:grid-cols-5">
        {STEPS.map((s, i) => {
          const active = s.id === step;
          const done = i < stepIndex;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex w-full flex-col rounded-[var(--radius-lg)] border px-3 py-3 text-left transition-colors",
                  active
                    ? "border-primary/40 bg-primary/10"
                    : done
                      ? "border-success/30 bg-success-bg/40"
                      : "border-border bg-surface hover:border-border/80",
                )}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">
                  Step {i + 1}
                </span>
                <span
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    active ? "text-primary" : "text-fg",
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* SEE */}
      {step === "see" && (
        <section className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-fg">1. See a live 402</h2>
            <Badge variant="learn">Lab · no real money</Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            <Link to="/guides/what-is-x402" className="link-readable">
              402 — payment required with a machine-readable price
            </Link>
            . Call{" "}
            <code className="text-fg">{X402_RESOURCE_PATH}</code> without a
            payment header. A correct educational endpoint answers{" "}
            <strong className="text-fg">HTTP 402</strong> with{" "}
            <code className="text-fg">PAYMENT-REQUIRED</code> (canonical V2) and
            machine-readable requirements — not a login page.
          </p>
          <Button disabled={busy} onClick={() => void fetchLab()}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4" />
            )}
            Fetch lab 402
          </Button>
          {labStatus !== null && (
            <div className="space-y-2">
              <p className="font-mono text-sm text-fg">
                Status:{" "}
                <span
                  className={
                    labStatus === 402 ? "text-primary" : "text-warn"
                  }
                >
                  {labStatus}
                </span>
              </p>
              {labBody && (
                <pre className="max-h-72 overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-[11px] leading-relaxed text-muted">
                  {labBody}
                </pre>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              disabled={labStatus !== 402}
              onClick={() => setStep("read")}
            >
              Next: read the price tag
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </section>
      )}

      {/* READ */}
      {step === "read" && (
        <section className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-fg">
            2. Read the payment requirements
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Agents (and humans) must see{" "}
            <strong className="text-fg">amount, network, asset, payTo</strong>{" "}
            before signing. Check each field from the lab response.
          </p>
          {parsed ? (
            <dl className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["amount", parsed.amount],
                  ["network", parsed.network],
                  ["asset", parsed.asset],
                  ["payTo", parsed.payTo],
                ] as const
              ).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-[var(--radius-md)] border border-border bg-bg p-3"
                >
                  <dt className="text-xs uppercase tracking-wide text-subtle">
                    {k}
                  </dt>
                  <dd className="mt-1 break-all font-mono text-sm text-fg">
                    {v ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-warn">
              Fetch the lab 402 in step 1 first so we can parse fields.
            </p>
          )}
          <div className="space-y-2">
            {(
              [
                ["amount", "I see the amount"],
                ["network", "I see the CAIP-2 network (solana:…)"],
                ["asset", "I see the asset"],
                ["payTo", "I see payTo"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-sm text-fg"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-[var(--color-primary)]"
                  checked={checklist[key]}
                  onChange={(e) =>
                    setChecklist((c) => ({ ...c, [key]: e.target.checked }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setStep("see")}>
              Back
            </Button>
            <Button disabled={!readReady} onClick={() => setStep("dry")}>
              Next: dry-run the loop
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </section>
      )}

      {/* DRY */}
      {step === "dry" && (
        <section className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-fg">3. Dry-run the loop</h2>
            <Badge variant="default">No private keys · no spend</Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Mentally walk what a safe client does. This step never asks for a
            seed or mainnet spend.
          </p>
          <ol className="space-y-2">
            {(
              [
                ["request", "1. Client requests a protected resource"],
                ["pay", "2. Client pays only after showing amount/network/asset/payTo"],
                ["retry", "3. Client retries with PAYMENT-SIGNATURE (legacy: X-PAYMENT)"],
                ["unlock", "4. Server verifies and returns the resource"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-sm text-fg"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[var(--color-primary)]"
                  checked={dryChecks[key]}
                  onChange={(e) =>
                    setDryChecks((c) => ({ ...c, [key]: e.target.checked }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </ol>
          <div className="rounded-[var(--radius-md)] border border-border/80 bg-bg/80 p-4 text-sm text-muted">
            <p className="mb-2 flex items-center gap-2 font-medium text-fg">
              <Shield className="size-4 text-primary" />
              Safety reminder
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Devnet first (practice chain, free test SOL — no real money); mainnet only with explicit human consent.</li>
              <li>Never paste private keys into a website or agent chat.</li>
              <li>Cap spend and allowlist payTo addresses for agents.</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setStep("read")}>
              Back
            </Button>
            <Button disabled={!dryReady} onClick={() => setStep("quiz")}>
              Next: knowledge check
              <ChevronRight className="size-4" />
            </Button>
            <Button asChild variant="outline">
              <Link to="/donate">Optional tip (never required)</Link>
            </Button>
          </div>
        </section>
      )}

      {/* QUIZ */}
      {step === "quiz" && (
        <section className="space-y-5 rounded-[var(--radius-xl)] border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-fg">4. Knowledge check</h2>
            <Badge variant="success">
              Pass ≥ {Math.round(LOOP_PASS_THRESHOLD * 100)}%
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Ten questions from Ship x402 guides. Same free certificate for
            everyone who passes — tips never unlock a “better” credential.
          </p>
          <div className="space-y-6">
            {LOOP_QUIZ.map((q, qi) => (
              <fieldset key={q.id} className="space-y-2">
                <legend className="text-sm font-semibold text-fg">
                  {qi + 1}. {q.prompt}
                </legend>
                <div className="space-y-1.5">
                  {q.choices.map((choice, ci) => {
                    const selected = answers[q.id] === ci;
                    const show = submitted;
                    const isCorrect = ci === q.answer;
                    return (
                      <label
                        key={ci}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 text-sm transition-colors",
                          selected
                            ? "border-primary/40 bg-primary/10 text-fg"
                            : "border-border bg-bg text-muted hover:text-fg",
                          show && isCorrect && "border-success/40 bg-success-bg",
                          show && selected && !isCorrect && "border-warn/40",
                        )}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          className="mt-0.5 size-4 accent-[var(--color-primary)]"
                          checked={selected}
                          onChange={() => {
                            setSubmitted(false);
                            setAnswers((a) => ({ ...a, [q.id]: ci }));
                          }}
                        />
                        <span>{choice}</span>
                      </label>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="text-xs leading-relaxed text-subtle">
                    {q.explain}
                  </p>
                )}
              </fieldset>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                const answered = Object.keys(answers).length;
                if (answered < LOOP_QUIZ.length) {
                  toast.error("Answer every question first");
                  return;
                }
                setSubmitted(true);
                const s = scoreQuiz(answers);
                if (s.passed) {
                  toast.success(
                    `Passed ${s.correct}/${s.total} — claim your free certificate`,
                  );
                } else {
                  toast.message(
                    `Score ${s.correct}/${s.total}. Review explanations and try again.`,
                  );
                }
              }}
            >
              <TerminalSquare className="size-4" />
              Grade quiz
            </Button>
            {submitted && (
              <span className="text-sm text-muted">
                Score{" "}
                <strong className="text-fg">
                  {score.correct}/{score.total}
                </strong>
                {score.passed ? " — pass" : " — not yet"}
              </span>
            )}
          </div>
          {submitted && score.passed && (
            <div className="space-y-3 rounded-[var(--radius-lg)] border border-primary/25 bg-primary/5 p-4">
              <Label htmlFor="cert-name">Name on certificate (optional)</Label>
              <Input
                id="cert-name"
                placeholder="Your name or handle"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                maxLength={64}
              />
              <Button onClick={issueCert}>
                <Award className="size-4" />
                Issue free certificate
              </Button>
            </div>
          )}
          <Button variant="secondary" onClick={() => setStep("dry")}>
            Back
          </Button>
        </section>
      )}

      {/* CERT */}
      {step === "cert" && cert && (
        <section className="space-y-6">
          <div
            className="relative overflow-hidden rounded-[var(--radius-xl)] border border-primary/30 bg-surface p-6 sm:p-8"
            style={{
              backgroundImage:
                "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 8%, transparent), transparent 50%), linear-gradient(to bottom, var(--color-surface), var(--color-bg))",
            }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--color-primary)_1px,transparent_1px),linear-gradient(90deg,var(--color-primary)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="relative space-y-4 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Ship x402 · Educational certificate
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                x402 Payment Loop
              </h2>
              <p className="text-lg text-muted">
                This certifies that{" "}
                <strong className="text-fg">{cert.name}</strong> completed the
                interactive walkthrough and knowledge check.
              </p>
              <div className="mx-auto flex max-w-md flex-wrap justify-center gap-3 text-sm">
                <Badge variant="success">
                  <CheckCircle2 className="size-3.5" />
                  {cert.correct}/{cert.total} correct
                </Badge>
                <Badge variant="default">{cert.date}</Badge>
                <Badge variant="learn" className="font-mono">
                  {cert.id}
                </Badge>
              </div>
              <p className="mx-auto max-w-lg text-xs leading-relaxed text-subtle">
                This certificate confirms completion of Ship x402's
                educational walkthrough and quizzes. It is{" "}
                <strong className="text-muted">
                  not a professional license, accreditation, or employment
                  credential
                </strong>
                . Free for everyone who passes — tips never required.
              </p>
            </div>
          </div>

          <SupportNudge />

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/ship">Ship your own 402</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/learn">Back to Learn</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep("quiz");
                setCert(null);
                setSubmitted(false);
              }}
            >
              Retake quiz
            </Button>
          </div>
        </section>
      )}

      {step === "cert" && !cert && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6 text-sm text-muted">
          Complete the knowledge check first.{" "}
          <button
            type="button"
            className="font-medium text-primary underline"
            onClick={() => setStep("quiz")}
          >
            Go to quiz
          </button>
        </section>
      )}
    </div>
  );
}
