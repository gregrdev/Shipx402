import { useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  FlaskConical,
  Play,
  ShieldAlert,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AGENT_PROCESS_STEPS,
  AGENT_SAFETY_RULES,
  AGENT_X402_CHEATSHEET,
  buildAgentCurriculumPayload,
} from "@/lib/agent-curriculum";
import { copyText, cn } from "@/lib/utils";

/**
 * Human-readable agent classroom + machine curriculum export.
 * Does not request or display private keys.
 */
export function AgentsPanel({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [curriculumJson, setCurriculumJson] = useState<string>("");

  useEffect(() => {
    void fetch("/api/agents/curriculum")
      .then((r) => r.json())
      .then((data) => setCurriculumJson(JSON.stringify(data, null, 2)))
      .catch(() =>
        setCurriculumJson(JSON.stringify(buildAgentCurriculumPayload(), null, 2)),
      );
  }, []);

  const step = AGENT_PROCESS_STEPS[active]!;

  const markDone = () => {
    setDone((d) => ({ ...d, [step.id]: true }));
    if (active < AGENT_PROCESS_STEPS.length - 1) {
      setActive((a) => a + 1);
    }
    toast.success(`Marked “${step.title}” complete`);
  };

  return (
    <div className={cn("space-y-5", !compact && "animate-fade-up")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Agent classroom
            </h2>
            <Badge variant="learn">For AI agents + humans training them</Badge>
          </div>
          <p className="max-w-2xl text-base text-muted">
            Walk the full Ship x402 process safely: teach wallets, write-downs, backups,
            transfers, and x402 — without the agent ever holding user private keys.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            await copyText(curriculumJson || JSON.stringify(buildAgentCurriculumPayload(), null, 2));
            toast.success("Curriculum JSON copied for your agent");
          }}
        >
          <Copy className="size-4" />
          Copy curriculum JSON
        </Button>
      </div>

      <Card className="border-danger/25 bg-danger-bg/40">
        <CardHeader className="mb-0">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ShieldAlert className="size-5 text-danger" />
            Non‑negotiable safety rules
          </CardTitle>
          <CardDescription>
            Agents must follow these. Breaking them is considered unsafe behavior.
          </CardDescription>
        </CardHeader>
        <ul className="mt-3 space-y-2">
          {AGENT_SAFETY_RULES.map((rule) => (
            <li
              key={rule}
              className="rounded-[var(--radius-md)] border border-border bg-bg/70 px-3 py-2.5 text-sm text-muted sm:text-base"
            >
              {rule}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="space-y-1">
          {AGENT_PROCESS_STEPS.map((s, i) => {
            const complete = !!done[s.id];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors",
                  active === i
                    ? "border-primary/40 bg-surface-2"
                    : "border-transparent hover:bg-surface",
                )}
              >
                {complete ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-subtle" />
                )}
                <span>
                  <span className="block text-xs font-medium text-subtle">
                    Step {i + 1}
                  </span>
                  <span className="block text-sm text-fg">{s.title}</span>
                </span>
              </button>
            );
          })}
        </div>

        <Card className="hearth-panel border-primary/20">
          <CardHeader>
            <div className="mb-1 flex items-center gap-2 text-sm text-primary">
              <Bot className="size-4" />
              Agent process · {active + 1}/{AGENT_PROCESS_STEPS.length}
            </div>
            <CardTitle className="text-xl">{step.title}</CardTitle>
            <CardDescription className="text-base">{step.goal}</CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">
                What the agent should do
              </div>
              <ul className="space-y-2">
                {step.agent_actions.map((a) => (
                  <li
                    key={a}
                    className="flex gap-2 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-muted sm:text-base"
                  >
                    <Play className="mt-1 size-3.5 shrink-0 text-primary" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-md)] border border-success/25 bg-success-bg p-3 text-sm text-success sm:text-base">
              <strong className="font-medium">Success check:</strong> {step.success}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={markDone}>
                <CheckCircle2 className="size-4" />
                Mark step complete
              </Button>
              {step.id === "x402" && (
                <Badge variant="learn" className="self-center">
                  Pair with x402 Lab tab
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FlaskConical className="size-5 text-primary" />
              x402 cheatsheet for agents
            </CardTitle>
            <CardDescription>
              Same loop humans see in the lab — usable by autonomous clients with consent.
            </CardDescription>
          </CardHeader>
          <dl className="space-y-2 text-sm sm:text-base">
            {Object.entries(AGENT_X402_CHEATSHEET).map(([k, v]) => (
              <div
                key={k}
                className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2"
              >
                <dt className="font-mono text-xs text-primary">{k}</dt>
                <dd className="mt-0.5 text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BookOpen className="size-5 text-primary" />
              Machine-readable curriculum
            </CardTitle>
            <CardDescription>
              Agents can fetch this JSON without a browser UI.
            </CardDescription>
          </CardHeader>
          <div className="space-y-3">
            <a
              className="link-readable inline-flex items-center gap-1.5 text-base font-medium"
              href="/api/agents/curriculum"
              target="_blank"
              rel="noreferrer"
            >
              GET /api/agents/curriculum
              <ExternalLink className="size-3.5" />
            </a>
            <pre className="max-h-56 overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-[10px] leading-relaxed text-muted sm:text-xs">
              {curriculumJson || "Loading…"}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}
