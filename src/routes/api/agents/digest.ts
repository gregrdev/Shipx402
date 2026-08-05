import { createFileRoute } from "@tanstack/react-router";
import { renderSiteDigestTxt } from "@/lib/site-catalog";

/** Plain-text hyper-condensed public site surface for LLMs / agents. */
import { rejectMethods } from "@/lib/http";

export const Route = createFileRoute("/api/agents/digest")({
  server: {
    handlers: {
      ...rejectMethods(["GET"], ["POST","PUT","PATCH","DELETE","OPTIONS"]),
      GET: async () =>
        new Response(renderSiteDigestTxt(), {
          status: 200,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=300",
            "access-control-allow-origin": "*",
            "x-robots-tag": "all",
          },
        }),
    },
  },
});
