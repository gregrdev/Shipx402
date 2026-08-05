import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  ExternalLink,
  FileText,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import { SiteChrome } from "@/components/site-chrome";
import { SupportNudge } from "@/components/support-nudge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import {
  APIS,
  DISCOVERY,
  GUIDES,
  PAGES,
  TOOLS,
  type CatalogItem,
} from "@/lib/site-catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools")({
  component: ToolsPage,
  ssr: true,
  head: () =>
    pageHead(SEO_PAGES.tools, {
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
        ]),
      ],
    }),
});

function CatalogCard({
  item,
  accent,
}: {
  item: CatalogItem;
  accent?: boolean;
}) {
  const isExternalApi = item.kind === "api" || item.kind === "discovery";
  const inner = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-fg">{item.name}</h3>
        <div className="flex flex-wrap gap-1.5">
          {item.method && (
            <Badge variant="default" className="font-mono text-[10px]">
              {item.method}
            </Badge>
          )}
          {item.tier && (
            <Badge
              variant={
                item.tier === "beginner"
                  ? "success"
                  : item.tier === "intermediate"
                    ? "learn"
                    : "real"
              }
            >
              {item.tier}
            </Badge>
          )}
        </div>
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{item.gist}</p>
      <p className="mt-3 font-mono text-xs text-primary">{item.path}</p>
    </>
  );

  if (isExternalApi) {
    return (
      <a
        href={item.path}
        className={cn(
          "flex flex-col rounded-[var(--radius-xl)] border p-4 no-underline transition-colors",
          accent
            ? "border-primary/35 bg-primary/5 hover:border-primary/50"
            : "border-border bg-surface hover:border-border-strong",
        )}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      to={item.path}
      className={cn(
        "flex flex-col rounded-[var(--radius-xl)] border p-4 no-underline transition-colors",
        accent
          ? "border-primary/35 bg-primary/5 hover:border-primary/50"
          : "border-border bg-surface hover:border-border-strong",
      )}
    >
      {inner}
    </Link>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  blurb,
  children,
}: {
  id: string;
  icon: typeof Wrench;
  title: string;
  blurb: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/15 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-fg">{title}</h2>
          <p className="mt-1 text-sm text-muted">{blurb}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ToolsPage() {
  const beginner = GUIDES.filter((g) => g.tier === "beginner");
  const intermediate = GUIDES.filter((g) => g.tier === "intermediate");
  const advanced = GUIDES.filter((g) => g.tier === "advanced");

  return (
    <SiteChrome activePath="/tools">
      <div className="space-y-12 animate-fade-up">
        <header className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
            Directory
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {SEO_PAGES.tools.h1}
          </h1>
          <p className="text-lg text-muted">
            Everything public on this site in one place — tools you can click, guides
            in learning order, and machine endpoints agents can fetch.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {(
              [
                { href: "#tools", label: "Tools" },
                { href: "#pages", label: "Pages" },
                { href: "#guides", label: "Guides" },
                { href: "#apis", label: "APIs" },
                { href: "#agents", label: "For agents" },
              ] as const
            ).map((j) => (
              <a
                key={j.href}
                href={j.href}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted no-underline hover:border-primary/40 hover:text-fg"
              >
                {j.label}
              </a>
            ))}
          </div>
        </header>

        <Section
          id="tools"
          icon={Wrench}
          title="Interactive tools"
          blurb="Things you can run in the browser right now — no account."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <CatalogCard key={t.path} item={t} accent />
            ))}
          </div>
        </Section>

        <Section
          id="pages"
          icon={FileText}
          title="Site pages"
          blurb="Core navigation — learning hub, wallet story, agents, about."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PAGES.map((p) => (
              <CatalogCard key={p.path} item={p} />
            ))}
          </div>
        </Section>

        <Section
          id="guides"
          icon={BookOpen}
          title="Guides · beginner → advanced"
          blurb="Read in order if you are new. Each card is one plain-English lesson."
        >
          <div className="space-y-6">
            {(
              [
                { label: "Beginner", items: beginner },
                { label: "Intermediate", items: intermediate },
                { label: "Advanced", items: advanced },
              ] as const
            ).map((group) => (
              <div key={group.label}>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-subtle">
                  {group.label}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((g) => (
                    <CatalogCard key={g.path} item={g} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="apis"
          icon={Search}
          title="Public APIs"
          blurb="JSON / plain text endpoints. Free. Rate-limited where needed."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {APIS.map((a) => (
              <CatalogCard key={a.path} item={a} />
            ))}
          </div>
        </Section>

        <Section
          id="agents"
          icon={Bot}
          title="For AI agents · one-file first stop"
          blurb="Agents should fetch a single condensed file before crawling HTML."
        >
          <div className="rounded-[var(--radius-xl)] border border-primary/30 bg-primary/5 p-5 cyber-edge">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="min-w-0 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-fg">
                    Start here: <code className="text-primary">/site.txt</code>
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    Hyper-condensed plain text of every public tool, page, guide, API,
                    and safety rule. One request → full gist. Same body also at{" "}
                    <code className="text-fg">/api/agents/digest</code>. Structured
                    twin:{" "}
                    <code className="text-fg">/api/agents/site</code> (JSON).
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <a href="/site.txt">
                      Open site.txt
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <a href="/api/agents/site">Open JSON catalog</a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href="/api/agents/curriculum">Curriculum JSON</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DISCOVERY.map((d) => (
              <CatalogCard key={d.path} item={d} />
            ))}
          </div>
        </Section>
      </div>
        <SupportNudge className="mt-10" />
    </SiteChrome>
  );
}
