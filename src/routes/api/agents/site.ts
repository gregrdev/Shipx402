import { createFileRoute } from "@tanstack/react-router";
import { renderSiteCatalogJson } from "@/lib/site-catalog";

/** JSON catalog of every public-facing page/tool/guide/api. */
import { rejectMethods } from "@/lib/http";

export const Route = createFileRoute("/api/agents/site")({
  server: {
    handlers: {
      ...rejectMethods(["GET"], ["POST","PUT","PATCH","DELETE","OPTIONS"]),
      GET: async () =>
        new Response(JSON.stringify(renderSiteCatalogJson(), null, 2), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=300",
            "access-control-allow-origin": "*",
          },
        }),
    },
  },
});
