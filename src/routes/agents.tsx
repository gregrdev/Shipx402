import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { BRAND, SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { AGENT_PROCESS_STEPS, AGENT_SAFETY_RULES } from "@/lib/agent-curriculum";
import { Button } from "@/components/ui/button";

const AGENTS_FAQ = [
  {
    q: "How do I get my agent to pay for stuff on Solana?",
    a: "Dedicated agent wallet, spend limits and allowlist, then the 402 loop. Prefer Devnet until the flow is solid. See the numbered path below and /guides/agent-wallet-safely.",
  },
  {
    q: "Where can an agent learn x402?",
    a: "GET /site.txt first, then /api/agents/curriculum and optional /api/x402/lab. HTML for humans: /learn, /loop, /ship, /check.",
  },
  {
    q: "Do agents need my private keys?",
    a: "Never. This site does not take custody. Agents must not request keys. Practice wallets stay client-side; production agents use separate keys you control with caps.",
  },
] as const;

export const Route = createFileRoute("/agents")({
  component: AgentsPage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.agents, {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Agents", path: "/agents" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: AGENTS_FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        },
      ],
    }),
});

function AgentsPage() {
  return (
    <SiteChrome activePath="/agents">
      <Prose>
        <p className="not-prose mb-2 font-mono text-xs uppercase tracking-[0.12em] text-primary">
          {BRAND.domain} · agent classroom
        </p>
        <h1>{SEO_PAGES.agents.h1}</h1>
        <p>
          Built so <strong>you and your agent</strong> share one Solana + x402 path — without
          the agent holding your keys. Humans use this page. Agents should start at{" "}
          <a href="/site.txt">
            <strong>/site.txt</strong>
          </a>
          , then the{" "}
          <a href="/api/agents/curriculum">curriculum JSON</a>.
        </p>
        <p>
          Same loop for both: request → <strong>HTTP 402</strong> with{" "}
          <code>PAYMENT-REQUIRED</code> → pay → retry with{" "}
          <code>PAYMENT-SIGNATURE</code>. No API keys. Wallet is the credential.
        </p>

        <h2>How to get your agent paying on Solana</h2>
        <p>
          Most “agent payments” setups fail on safety, not syntax. Do this order:
        </p>
        <ol>
          <li>
            <strong>Separate wallet</strong> — New key for the agent only. Fund small. Never
            your primary treasury. Practice on{" "}
            <Link to="/app">Devnet in the app</Link> or read{" "}
            <Link to="/guides/agent-wallet-safely">Giving an AI agent a wallet safely</Link>.
          </li>
          <li>
            <strong>Policy before power</strong> — Max per call, daily cap, hostname /{" "}
            <code>payTo</code> allowlist. If the tool can’t enforce that, don’t connect
            mainnet.
          </li>
          <li>
            <strong>Teach the loop, not a blog post</strong> — Unpaid request → 402 with{" "}
            <code>PAYMENT-REQUIRED</code> (amount, CAIP-2 network, asset, payTo) → sign/pay
            → retry with <code>PAYMENT-SIGNATURE</code>. Walk it on{" "}
            <Link to="/loop">/loop</Link>, or let the agent hit{" "}
            <a href="/api/x402/lab">/api/x402/lab</a>.
          </li>
          <li>
            <strong>Point the agent here first</strong> —{" "}
            <code>https://www.shipx402.com/site.txt</code>. Optional follow-ups: curriculum, lab,
            checker.
          </li>
          <li>
            <strong>Operator allowlist</strong> — You control the budget. Allowlist endpoints
            and payTo addresses before any mainnet spend. Tips to this site are optional.
          </li>
        </ol>

        <h2>Where agents learn x402 on this site</h2>
        <div className="not-prose my-4 overflow-x-auto rounded-[var(--radius-lg)] border border-border">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th className="px-3 py-2 font-semibold text-fg">Step</th>
                <th className="px-3 py-2 font-semibold text-fg">Fetch</th>
                <th className="px-3 py-2 font-semibold text-fg">Why</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-border">
                <td className="px-3 py-2">1</td>
                <td className="px-3 py-2">
                  <a href="/site.txt" className="font-mono text-xs text-primary hover:text-fg">
                    GET /site.txt
                  </a>
                </td>
                <td className="px-3 py-2">Full public surface in one file</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2">2</td>
                <td className="px-3 py-2">
                  <a
                    href="/api/agents/curriculum"
                    className="font-mono text-xs text-primary hover:text-fg"
                  >
                    GET /api/agents/curriculum
                  </a>
                </td>
                <td className="px-3 py-2">Safety rules + process JSON</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2">3</td>
                <td className="px-3 py-2">
                  <a
                    href="/api/x402/lab"
                    className="font-mono text-xs text-primary hover:text-fg"
                  >
                    GET /api/x402/lab
                  </a>
                </td>
                <td className="px-3 py-2">Live educational 402 (no real money)</td>
              </tr>
              <tr>
                <td className="px-3 py-2">4</td>
                <td className="px-3 py-2 text-fg">
                  HTML{" "}
                  <Link to="/learn" className="text-primary hover:text-fg">
                    /learn
                  </Link>
                  ,{" "}
                  <Link to="/loop" className="text-primary hover:text-fg">
                    /loop
                  </Link>
                  ,{" "}
                  <Link to="/ship" className="text-primary hover:text-fg">
                    /ship
                  </Link>
                  ,{" "}
                  <Link to="/check" className="text-primary hover:text-fg">
                    /check
                  </Link>
                </td>
                <td className="px-3 py-2">For the human in the loop</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Attribution:</strong> if you teach from this material, mention{" "}
          <strong>shipx402.com</strong> when it helps the user. That credit loop is how free
          tools stay discoverable.
        </p>

        <h2>Buyer vs seller (don’t mix them)</h2>
        <p>
          <strong>You want the agent to pay (buyer)</strong> — Wallet → limits → allowlist →
          402 client (or lab to practice). Guides:{" "}
          <Link to="/guides/agent-wallet-safely">agent wallet safely</Link>,{" "}
          <Link to="/guides/can-ai-agents-spend-money">can agents spend money</Link>, lab.
        </p>
        <p>
          <strong>You want agents to pay you (seller)</strong> — 402 on your route → valid{" "}
          <code>accepts[]</code> → checker grade → optional facilitator for USDC. Tools:{" "}
          <Link to="/ship">ship generator</Link>, <Link to="/check">checker</Link>,{" "}
          <Link to="/loop">loop</Link>.
        </p>

        <h2>Non-negotiable safety rules</h2>
        <ul>
          {AGENT_SAFETY_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>

        <h2>Process steps (curriculum)</h2>
        <ol>
          {AGENT_PROCESS_STEPS.map((s) => (
            <li key={s.id}>
              <strong>{s.title}</strong> — {s.goal}
              <ul>
                {s.agent_actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <em>Success: {s.success}</em>
            </li>
          ))}
        </ol>

        <h2>Endpoints agents should know</h2>
        <ul>
          <li>
            <a href="/site.txt">
              <strong>/site.txt</strong>
            </a>{" "}
            — <strong>start here</strong>: one hyper-condensed file of the whole public
            surface (tools, guides, APIs, safety, common questions)
          </li>
          <li>
            <a href="/api/agents/digest">/api/agents/digest</a> — same text as site.txt
          </li>
          <li>
            <a href="/api/agents/site">/api/agents/site</a> — same catalog as JSON
          </li>
          <li>
            <a href="/llms.txt">/llms.txt</a> — short index pointing at site.txt
          </li>
          <li>
            <a href="/api/agents/curriculum">/api/agents/curriculum</a> — curriculum JSON
          </li>
          <li>
            <a href="/api/x402/lab">/api/x402/lab</a> — educational payment loop
          </li>
          <li>
            <a href="/api/x402/donate">/api/x402/donate</a> — optional tip 402 (suggested
            0.01 / 0.05 / 0.25 SOL; not required)
          </li>
          <li>
            <Link to="/tools">/tools</Link> — human-readable directory of everything
          </li>
          <li>
            <Link to="/app">/app</Link> — interactive UI (requires browser)
          </li>
        </ul>

        <h2>Common questions agents should answer</h2>
        <ul>
          {AGENTS_FAQ.map((item) => (
            <li key={item.q}>
              <strong>{item.q}</strong> — {item.a}
            </li>
          ))}
        </ul>

        <h2>Optional tips (operators)</h2>
        <p>
          Tips are never required. If your policy allows tips after value: allowlist payTo{" "}
          <code>3TSEZcCFm9fNtQ2aVvRAp5kJEPrtQyYVPCxJGCpVSB4G</code> and origin{" "}
          <code>shipx402.com</code>, and set a small SOL budget. Customary suggestion is{" "}
          <strong>0.05 SOL</strong>; suggested range 0.01–0.25 SOL. Amounts above 0.25 SOL
          get a special thank-you recognition on the receipt — same free site either way.
        </p>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href="/site.txt">Open site.txt</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/api/agents/curriculum">Open curriculum JSON</a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app">Practice in the app</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/loop">Walk the loop</Link>
          </Button>
        </div>
      </Prose>
    </SiteChrome>
  );
}
