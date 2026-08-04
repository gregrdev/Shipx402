import { useMemo, useState } from "react";
import { Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { copyText, cn } from "@/lib/utils";
import {
  type ShipForm,
  type ShipFramework,
  type ShipNetwork,
  agentPrompt,
  codeSnippet,
  envSnippet,
  installLine,
  isMainnet,
  testCurl,
  validatePayTo,
} from "@/lib/ship-templates";

const FRAMEWORKS: { id: ShipFramework; label: string }[] = [
  { id: "express", label: "Express" },
  { id: "next", label: "Next.js" },
  { id: "hono", label: "Hono" },
];

const NETWORKS: { id: ShipNetwork; label: string; note?: string }[] = [
  { id: "solana-devnet", label: "Solana Devnet", note: "Free test money" },
  { id: "solana", label: "Solana Mainnet" },
  { id: "base-sepolia", label: "Base Sepolia", note: "Testnet" },
  { id: "base", label: "Base Mainnet" },
];

type OutTab = "install" | "code" | "env" | "test" | "prod" | "prompt";

/** Client-only generator — nothing leaves the browser */
export function ShipGenerator() {
  const [form, setForm] = useState<ShipForm>({
    framework: "express",
    network: "solana-devnet",
    priceUsd: "0.01",
    payTo: "",
    route: "/api/premium",
    description: "Premium API access",
    inputSchema: "",
    outputSchema: "",
  });
  const [tab, setTab] = useState<OutTab>("code");

  const payErr = validatePayTo(form.network, form.payTo);
  const valid = !payErr && form.payTo.trim().length > 0;

  const sampleForm: ShipForm = useMemo(
    () => ({
      ...form,
      payTo:
        form.network.startsWith("solana")
          ? "So1anaExamp1eAddress1111111111111111111111"
          : "0x0000000000000000000000000000000000000001",
    }),
    [form],
  );

  const panels = useMemo(() => {
    const f = valid ? form : sampleForm;
    return {
      install: installLine(f.framework),
      code: codeSnippet(f, false),
      env: envSnippet(f, false),
      test: testCurl(f),
      prod: [
        codeSnippet(f, true),
        "",
        "// --- production notes ---",
        "// Facilitator options:",
        "// 1) Coinbase CDP facilitator: free tier, needs CDP account (docs.cdp.coinbase.com/x402)",
        "// 2) PayAI public facilitator: https://facilitator.payai.network",
        "// Verify package APIs against https://docs.x402.org before shipping.",
        "",
        envSnippet(f, true),
      ].join("\n"),
      prompt: agentPrompt(f),
    };
  }, [form, valid, sampleForm]);

  const activeText = panels[tab === "prod" ? "prod" : tab];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <div>
          <Label>Framework</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {FRAMEWORKS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setForm((s) => ({ ...s, framework: f.id }))}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm font-medium",
                  form.framework === f.id
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border text-muted hover:text-fg",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Network</Label>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {NETWORKS.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setForm((s) => ({ ...s, network: n.id }))}
                className={cn(
                  "rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm",
                  form.network === n.id
                    ? "border-primary/40 bg-primary/10"
                    : "border-border hover:border-border-strong",
                )}
              >
                <div className="font-medium text-fg">{n.label}</div>
                {n.note && <div className="text-xs text-subtle">{n.note}</div>}
                {isMainnet(n.id) && form.network === n.id && (
                  <Badge variant="real" className="mt-1">
                    Real funds
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Price (USD)</Label>
            <Input
              value={form.priceUsd}
              onChange={(e) => setForm((s) => ({ ...s, priceUsd: e.target.value }))}
              inputMode="decimal"
            />
          </div>
          <div>
            <Label>Route to protect</Label>
            <Input
              value={form.route}
              onChange={(e) => setForm((s) => ({ ...s, route: e.target.value }))}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <Label>Receiving wallet (payTo)</Label>
          <Input
            value={form.payTo}
            onChange={(e) => setForm((s) => ({ ...s, payTo: e.target.value }))}
            className="font-mono text-sm"
            placeholder={
              form.network.startsWith("solana")
                ? "Solana base58 address"
                : "0x… EVM address"
            }
            spellCheck={false}
          />
          {form.payTo && payErr && (
            <p className="mt-1.5 text-sm text-danger">{payErr}</p>
          )}
        </div>

        <div>
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Input schema (optional JSON)</Label>
            <Textarea
              value={form.inputSchema}
              onChange={(e) => setForm((s) => ({ ...s, inputSchema: e.target.value }))}
              className="min-h-[72px] font-mono text-xs"
              placeholder='{"type":"object"}'
            />
          </div>
          <div>
            <Label>Output schema (optional JSON)</Label>
            <Textarea
              value={form.outputSchema}
              onChange={(e) => setForm((s) => ({ ...s, outputSchema: e.target.value }))}
              className="min-h-[72px] font-mono text-xs"
              placeholder='{"type":"object"}'
            />
          </div>
        </div>
        <p className="text-xs text-subtle">
          Schemas improve discovery in the x402 Bazaar. Nothing you type is uploaded.
        </p>
      </div>

      <div className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["install", "Install"],
              ["code", "Code"],
              ["env", "Env"],
              ["test", "Test"],
              ["prod", "Production"],
              ["prompt", "AI prompt"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium",
                tab === id
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {!valid && (
          <div className="flex gap-2 rounded-[var(--radius-md)] border border-border bg-bg p-3 text-sm text-muted">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
            Showing a sample snippet. Enter your real payTo address to personalize it.
          </div>
        )}
        <pre className="max-h-[28rem] overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-4 font-mono text-[11px] leading-relaxed text-muted">
          {activeText}
        </pre>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              await copyText(activeText);
              toast.success("Copied");
            }}
          >
            <Copy className="size-4" />
            Copy
          </Button>
          <Button asChild variant="outline">
            <Link to="/check">Validate with 402 Checker</Link>
          </Button>
        </div>
        <p className="text-xs text-subtle">
          Templates use @x402/* v2 (routes + x402ResourceServer, CAIP-2 networks). Packages:
          @x402/express, @x402/next, @x402/hono. Verify signatures against docs.x402.org before
          production.
        </p>
      </div>
    </div>
  );
}
