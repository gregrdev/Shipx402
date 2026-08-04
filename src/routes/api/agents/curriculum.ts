import { createFileRoute } from "@tanstack/react-router";
import { buildAgentCurriculumPayload } from "@/lib/agent-curriculum";

/**
 * Machine-readable curriculum for agents (and humans training agents).
 * Public, no secrets, safe to fetch without auth.
 */
export const Route = createFileRoute("/api/agents/curriculum")({
  server: {
    handlers: {
      GET: async () => {
        const body = buildAgentCurriculumPayload();
        return new Response(JSON.stringify(body, null, 2), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*",
            "cache-control": "public, max-age=300",
          },
        });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, OPTIONS",
          },
        }),
    },
  },
});
