import { createFileRoute } from "@tanstack/react-router";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import https from "node:https";
import { grade402Response } from "@/lib/check-402-grade";

/**
 * POST { url } — fetch target once (SSRF-hardened) and grade x402 402 body.
 * Stores nothing. Rate-limited in memory per IP.
 *
 * DNS rebinding mitigation: resolve once, reject private IPs, then connect
 * to that pinned address while sending the original Host + TLS SNI.
 */

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const MAX_BODY = 256 * 1024;
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 2;
const UA = "ShipX402-Checker/1.0 (+https://shipx402.com/check)";

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const cur = rateMap.get(ip);
  if (!cur || now > cur.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (cur.count >= RATE_LIMIT) return false;
  cur.count += 1;
  return true;
}

function isPrivateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b !== undefined && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b !== undefined && b >= 64 && b <= 127) return true;
    return false;
  }
  if (v === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe80")) return true;
    if (lower.startsWith(":ffff:")) {
      const mapped = lower.slice(7);
      if (isIP(mapped) === 4) return isPrivateIp(mapped);
    }
    return false;
  }
  return true;
}

async function resolvePublicIp(host: string): Promise<string> {
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new Error("Private/reserved IPs are blocked");
    return host;
  }
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error("Localhost targets are blocked");
  }
  const records = await lookup(host, { all: true });
  if (!records.length) throw new Error("Could not resolve hostname");
  const publicOnes = records.filter((r) => !isPrivateIp(r.address));
  if (!publicOnes.length) {
    throw new Error("Hostname resolves only to private/reserved addresses");
  }
  // Prefer IPv4 for simpler pinning
  const v4 = publicOnes.find((r) => r.family === 4);
  return (v4 ?? publicOnes[0]).address;
}

function parseHttpsUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }
  if (u.protocol !== "https:") throw new Error("HTTPS URLs only");
  if (u.username || u.password) throw new Error("URLs with credentials are not allowed");
  return u;
}

/** Resolve once, pin IP, TLS SNI = original host (anti DNS rebinding). */
function pinnedHttpsGet(
  url: URL,
  pinnedIp: string,
): Promise<{ status: number; headers: Record<string, string>; bodyText: string }> {
  return new Promise((resolve, reject) => {
    const path = `${url.pathname}${url.search}`;
    const req = https.request(
      {
        host: pinnedIp,
        servername: url.hostname, // SNI
        port: url.port ? Number(url.port) : 443,
        path,
        method: "GET",
        headers: {
          host: url.host,
          accept: "application/json, text/plain, */*",
          "user-agent": UA,
          connection: "close",
        },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let total = 0;
        res.on("data", (chunk: Buffer) => {
          total += chunk.length;
          if (total <= MAX_BODY) chunks.push(chunk);
        });
        res.on("end", () => {
          const headers: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.headers)) {
            if (typeof v === "string") headers[k.toLowerCase()] = v;
            else if (Array.isArray(v)) headers[k.toLowerCase()] = v.join(", ");
          }
          resolve({
            status: res.statusCode ?? 0,
            headers,
            bodyText: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Upstream timed out (10s)"));
    });
    req.on("error", reject);
    req.end();
  });
}

async function safeFetch(startUrl: string): Promise<{
  status: number;
  headers: Record<string, string>;
  bodyText: string;
  finalUrl: string;
}> {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = parseHttpsUrl(current);
    const pinnedIp = await resolvePublicIp(url.hostname);
    const res = await pinnedHttpsGet(url, pinnedIp);

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers["location"];
      if (!loc) throw new Error("Redirect without Location");
      current = new URL(loc, current).toString();
      if (hop === MAX_REDIRECTS) throw new Error("Too many redirects");
      continue;
    }

    return {
      status: res.status,
      headers: res.headers,
      bodyText: res.bodyText,
      finalUrl: current,
    };
  }
  throw new Error("Fetch failed");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/check-402")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = clientIp(request);
        if (!rateLimit(ip)) {
          return json(
            {
              error: "Rate limit: max 10 checks per minute. Try again shortly.",
            },
            429,
          );
        }

        let body: { url?: string };
        try {
          body = (await request.json()) as { url?: string };
        } catch {
          return json({ error: 'JSON body required: { "url": "https://..." }' }, 400);
        }
        const target = body.url?.trim();
        if (!target) return json({ error: "url is required" }, 400);

        try {
          const fetched = await safeFetch(target);
          const report = grade402Response({
            url: fetched.finalUrl,
            status: fetched.status,
            headers: fetched.headers,
            bodyText: fetched.bodyText,
          });
          return json({ ok: true, report });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Check failed";
          if (message.includes("timed out")) {
            return json({ error: message }, 504);
          }
          return json({ error: message }, 400);
        }
      },
    },
  },
});
