/**
 * Origin-hosted x402 discovery manifest.
 * Path: /.well-known/x402  (RFC 8615). MUST be application/json.
 *
 * Dual-compatible:
 * - x402scan fan-out: { version, resources: string[] }
 * - draft-hawkins-x402-dns-discovery: { x402Version, kind, name, docs, updated }
 *
 * We are a resource-server (educational lab + optional donate), not a facilitator.
 * Payment headers: https://docs.x402.org/core-concepts/http-402
 */

import { BRAND } from "./brand";

export const WELL_KNOWN_X402 = {
  x402Version: 2,
  kind: "resource-server",
  name: BRAND.name,
  description:
    "Independent educational site. Lab uses exact-lab signed intents (no on-chain). Donate verifies real mainnet SOL via a custom onchain-sol scheme — not facilitator exact USDC.",
  version: 1,
  resources: [
    `${BRAND.canonicalOrigin}/api/x402/donate`,
    `${BRAND.canonicalOrigin}/api/x402/lab`,
  ],
  docs: `${BRAND.canonicalOrigin}/learn`,
  documentation: `${BRAND.canonicalOrigin}/learn`,
  agentCard: `${BRAND.canonicalOrigin}/.well-known/agent-card.json`,
  siteDigest: `${BRAND.canonicalOrigin}/site.txt`,
  instructions:
    "V2 headers (docs.x402.org): PAYMENT-REQUIRED (402), PAYMENT-SIGNATURE (retry), PAYMENT-RESPONSE (settle). X-PAYMENT is the legacy V1 alias. Curriculum: /api/agents/curriculum. Digest: /site.txt",
  updated: "2026-09-16T00:00:00Z",
  attestation: { type: "none" },
} as const;

export function wellKnownX402Headers(): Record<string, string> {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=300",
  };
}
