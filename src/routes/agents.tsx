import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome, Prose } from "@/components/site-chrome";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { AGENT_PROCESS_STEPS, AGENT_SAFETY_RULES } from "@/lib/agent-curriculum";
import { Button } from "@/components/ui/button";

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
      ],
    }),
});

function AgentsPage() {
  return (
    <SiteChrome activePath="/agents">
      <Prose>
        <h1>{SEO_PAGES.agents.h1}</h1>
        <p>
          Ship x402 is designed so AI agents can learn and teach the full wallet + x402
          path <strong>without taking custody of keys</strong>. This page is SSR HTML;
          the machine JSON lives at{" "}
          <a href="/api/agents/curriculum">/api/agents/curriculum</a>.
        </p>

        <h2>Non-negotiable safety rules</h2>
        <ul>
          {AGENT_SAFETY_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>

        <h2>Process steps</h2>
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
            <a href="/llms.txt">/llms.txt</a> — site map for machines
          </li>
          <li>
            <a href="/api/agents/curriculum">/api/agents/curriculum</a> — curriculum JSON
          </li>
          <li>
            <a href="/api/x402/lab">/api/x402/lab</a> — educational payment loop
          </li>
          <li>
            <Link to="/app">/app</Link> — interactive UI (requires browser)
          </li>
        </ul>

        <div className="not-prose mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/app">Practice in the app</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="/api/agents/curriculum">Open curriculum JSON</a>
          </Button>
        </div>
      </Prose>
    </SiteChrome>
  );
}
