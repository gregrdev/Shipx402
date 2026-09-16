/**
 * Durable single-use store for mainnet donation transaction signatures.
 *
 * Process-local Maps are not enough: Vercel isolates would re-credit the same
 * sig. Claim is atomic (Redis SET NX, or O_EXCL file create).
 *
 * Backends:
 *   1. Vercel KV / Upstash Redis REST when KV_REST_API_URL (or
 *      UPSTASH_REDIS_REST_URL) + matching token are set.
 *   2. Filesystem directory (CREDITED_SIG_PATH or ./data/credited-donation-sigs).
 *
 * If no durable backend can complete the claim, we fail closed — no receipt.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KEY_PREFIX = "shipx402:donate:sig:";
/** Keep longer than DONATION_MAX_AGE_SECONDS so TTL cannot outrun the age check. */
const DEFAULT_TTL_SECONDS = 6 * 60 * 60;

export type ClaimResult = "ok" | "duplicate";

function kvConfig(): { url: string; token: string } | null {
  const url = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ""
  ).trim();
  const token = (
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ""
  ).trim();
  if (url && token) return { url, token };
  return null;
}

function fileDir(): string {
  const fromEnv = process.env.CREDITED_SIG_PATH?.trim();
  if (fromEnv) return fromEnv;
  return join(process.cwd(), "data", "credited-donation-sigs");
}

function safeSigFileName(signature: string): string {
  // Solana tx signatures are base58; reject path separators.
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(signature) || signature.length > 128) {
    throw new Error("Signature is not a safe replay-store key");
  }
  return `${signature}.claimed`;
}

async function claimRedis(
  signature: string,
  ttlSeconds: number,
): Promise<ClaimResult> {
  const cfg = kvConfig();
  if (!cfg) throw new Error("KV not configured");
  const key = `${KEY_PREFIX}${signature}`;
  const res = await fetch(`${cfg.url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${cfg.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify([["SET", key, String(Date.now()), "NX", "EX", String(ttlSeconds)]]),
  });
  if (!res.ok) {
    throw new Error(`KV claim failed (${res.status})`);
  }
  const body = (await res.json()) as { result?: unknown }[] | { result?: unknown };
  const row = Array.isArray(body) ? body[0] : body;
  const result = row && typeof row === "object" ? (row as { result?: unknown }).result : undefined;
  // Upstash: SET NX returns "OK" if set, null if not.
  if (result === "OK" || result === true) return "ok";
  if (result === null || result === undefined) return "duplicate";
  throw new Error("KV claim returned unexpected result");
}

function claimFile(signature: string): ClaimResult {
  const dir = fileDir();
  mkdirSync(dir, { recursive: true });
  const path = join(dir, safeSigFileName(signature));
  try {
    writeFileSync(path, `${Date.now()}\n`, { flag: "wx" });
    return "ok";
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
    if (code === "EEXIST") return "duplicate";
    throw err;
  }
}

/**
 * Atomically mark `signature` as credited. Returns "duplicate" if already used.
 * Throws if no durable backend is available / reachable (caller must fail closed).
 */
export async function claimDonationSignatureOnce(
  signature: string,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): Promise<ClaimResult> {
  if (kvConfig()) {
    return claimRedis(signature, ttlSeconds);
  }
  try {
    return claimFile(signature);
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      throw new Error(
        "Durable signature store unavailable. Set KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_*) so donation receipts cannot be replayed across isolates.",
      );
    }
    throw err;
  }
}

export function donationSigStoreKind(): "kv" | "fs" {
  return kvConfig() ? "kv" : "fs";
}
