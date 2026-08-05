import { createFileRoute } from "@tanstack/react-router";
import { lookupWallet, isLookupAddress } from "@/lib/wallet-lookup";
import type { NetworkMode } from "@/lib/solana";

/**
 * GET /api/wallet/lookup?address=…&network=mainnet-beta|devnet
 * or POST JSON { address, network?, limit? }
 *
 * Returns SOL balance, optional USD estimate, and recent transactions.
 * Public data only — no private keys. In-memory rate limit per IP.
 */

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

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

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "Content-Type",
      "cache-control": "no-store",
    },
  });
}

function parseNetwork(raw: unknown): NetworkMode {
  const s = String(raw ?? "mainnet-beta").toLowerCase();
  if (s === "devnet" || s === "solana-devnet") return "devnet";
  return "mainnet-beta";
}

async function handleLookup(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip)) {
    return json(
      { error: "Rate limit — try again in a minute" },
      429,
    );
  }

  let address = "";
  let network: NetworkMode = "mainnet-beta";
  let limit = 12;

  if (request.method === "POST") {
    try {
      const body = (await request.json()) as {
        address?: string;
        network?: string;
        limit?: number;
      };
      address = String(body.address ?? "").trim();
      network = parseNetwork(body.network);
      if (typeof body.limit === "number") limit = body.limit;
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
  } else {
    const url = new URL(request.url);
    address = (url.searchParams.get("address") ?? "").trim();
    network = parseNetwork(url.searchParams.get("network"));
    const lim = url.searchParams.get("limit");
    if (lim) limit = Number(lim) || 12;
  }

  if (!address) {
    return json(
      {
        error: "Missing address",
        hint: "Pass ?address=<base58 pubkey> or JSON { address }",
      },
      400,
    );
  }
  if (!isLookupAddress(address)) {
    return json(
      {
        error: "Invalid Solana address",
        hint: "Use a base58 public key (wallet address), not a private key.",
      },
      400,
    );
  }

  try {
    const result = await lookupWallet({ address, network, limit });
    return json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lookup failed";
    return json(
      {
        error: "Could not read wallet from RPC",
        reason: message,
        hint: "Public RPC may be rate-limited. Retry shortly, or the site owner can set SOLANA_RPC_URL.",
      },
      502,
    );
  }
}

import { rejectMethods } from "@/lib/http";

export const Route = createFileRoute("/api/wallet/lookup")({
  server: {
    handlers: {
      ...rejectMethods(["GET","POST","OPTIONS"], ["PUT","PATCH","DELETE"]),
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, POST, OPTIONS",
            "access-control-allow-headers": "Content-Type",
          },
        }),
      GET: async ({ request }) => handleLookup(request),
      POST: async ({ request }) => handleLookup(request),
    },
  },
});
