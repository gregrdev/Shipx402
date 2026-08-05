/**
 * Shared HTTP helpers for API routes.
 *
 * Why this exists: a TanStack Start server route only handles the HTTP methods
 * it explicitly defines. Any *other* method falls through to the SSR catch-all
 * and returns `200` with the full HTML app shell — misleading for an
 * agent-first site (an agent POSTing to a GET-only endpoint gets a web page,
 * not an error). `rejectMethods` wires the remaining verbs to a correct
 * `405 Method Not Allowed` with an `Allow` header.
 */

/** A single handler that always answers 405 with the allowed-method list. */
export function methodNotAllowed(allow: readonly string[]) {
  return async () =>
    new Response(
      JSON.stringify({ error: "Method Not Allowed", allow: allow.join(", ") }),
      {
        status: 405,
        headers: {
          "content-type": "application/json; charset=utf-8",
          allow: allow.join(", "),
          "access-control-allow-origin": "*",
          "cache-control": "no-store",
        },
      },
    );
}

/**
 * Build a handler map that 405s every verb in `deny`, advertising `allow`.
 * Spread it into a route's `handlers` alongside the real methods:
 *
 *   handlers: {
 *     GET: async () => ...,
 *     OPTIONS: async () => ...,
 *     ...rejectMethods(["GET", "OPTIONS"], ["POST", "PUT", "PATCH", "DELETE"]),
 *   }
 */
export function rejectMethods(allow: readonly string[], deny: readonly string[]) {
  const handlers: Record<string, ReturnType<typeof methodNotAllowed>> = {};
  for (const method of deny) handlers[method] = methodNotAllowed(allow);
  return handlers;
}
