/**
 * Educational x402 helpers for Ship x402 Lab.
 *
 * Real production x402 (x402 Foundation / Coinbase CDP / public facilitators)
 * often uses headers like PAYMENT-REQUIRED / PAYMENT-SIGNATURE / PAYMENT-RESPONSE.
 * Solana native examples commonly use HTTP 402 body + X-PAYMENT retry.
 *
 * This lab implements a simplified, fully working "exact-lab" scheme so you can
 * experience the 402 → pay → retry loop without needing mainnet USDC.
 *
 * 2026: challenge envelope is x402 v2-shaped (CAIP-2 network, top-level resource,
 * amount field) with legacy v1 mirrors so older clients and the in-app lab still work.
 */

import bs58 from "bs58";
import nacl from "tweetnacl";
import { keypairFromSecret } from "./solana";

/** Advertised protocol version on the 402 challenge (v2 envelope). */
export const X402_VERSION = 2;
/** Still accept signed proofs that use x402Version 1 for lab compat. */
export const X402_VERSION_LEGACY = 1;
export const X402_LAB_SCHEME = "exact-lab";
export const X402_RESOURCE_PATH = "/api/x402/lab";

/** Solana Devnet CAIP-2 (x402 v2 / docs.x402.org). */
export const SOLANA_DEVNET_CAIP2 = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";
/** Legacy network string still accepted on inbound lab proofs. */
export const SOLANA_DEVNET_LEGACY = "solana-devnet";

export const X402_LAB_PRICE_LABEL = "0.001 USDC-equivalent (lab units)";
export const X402_LAB_AMOUNT = "1000";

export type X402ResourceInfo = {
  url: string;
  description: string;
  mimeType: string;
};

export type X402AcceptRequirement = {
  scheme: string;
  network: string;
  /** v2: amount in atomic units as digit string */
  amount: string;
  asset: string;
  payTo: string;
  maxTimeoutSeconds: number;
  // --- legacy v1 mirrors (kept for lab UI + older readers) ---
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  extra?: Record<string, string>;
};

export type X402PaymentRequirements = {
  x402Version: number;
  error: string;
  /** v2 top-level ResourceInfo */
  resource: X402ResourceInfo;
  accepts: X402AcceptRequirement[];
  extensions?: Record<string, unknown>;
  why: string;
};

export type X402LabPayload = {
  payer: string;
  resource: string;
  amount: string;
  nonce: string;
  timestamp: number;
  signature: string;
  /** Bound when the 402 challenge advertises payTo (lab merchant). */
  payTo?: string;
};

export type X402PaymentProof = {
  x402Version: number;
  scheme: string;
  network: string;
  payload: X402LabPayload;
};

export function buildLabMessage(parts: {
  resource: string;
  amount: string;
  nonce: string;
  payer: string;
  timestamp: number;
  payTo?: string;
}) {
  const fields = [
    "x402-lab-v1",
    parts.resource,
    parts.amount,
    parts.nonce,
    parts.payer,
    String(parts.timestamp),
  ];
  if (parts.payTo) fields.push(parts.payTo);
  return fields.join(":");
}

export function createPaymentRequirements(payTo: string): X402PaymentRequirements {
  const description = "Premium Solana fact of the day (Ship x402 lab)";
  const mimeType = "application/json";
  return {
    x402Version: X402_VERSION,
    error: "Payment required to access this resource",
    resource: {
      url: X402_RESOURCE_PATH,
      description,
      mimeType,
    },
    accepts: [
      {
        scheme: X402_LAB_SCHEME,
        network: SOLANA_DEVNET_CAIP2,
        amount: X402_LAB_AMOUNT,
        asset: "lab-usdc",
        payTo,
        maxTimeoutSeconds: 120,
        // legacy v1 mirrors
        maxAmountRequired: X402_LAB_AMOUNT,
        resource: X402_RESOURCE_PATH,
        description,
        mimeType,
          extra: {
            note: "Lab scheme exact-lab: sign a payment intent with your wallet. This is not Coinbase CDP / PayAI facilitator settle and not on-chain USDC exact. Production often settles USDC via a facilitator.",
          humanPrice: X402_LAB_PRICE_LABEL,
          caip2: SOLANA_DEVNET_CAIP2,
          legacyNetwork: SOLANA_DEVNET_LEGACY,
          mode: "lab-signature — no on-chain settlement",
        },
      },
    ],
    extensions: {},
    why: "The server is paid per request instead of using accounts, API keys, or subscriptions. HTTP 402 is the built-in signal that means 'pay, then retry'.",
  };
}

export function encodeXPaymentHeader(proof: X402PaymentProof) {
  const json = JSON.stringify(proof);
  return typeof btoa === "function"
    ? btoa(json)
    : Buffer.from(json, "utf8").toString("base64");
}

export function decodeXPaymentHeader(header: string): X402PaymentProof {
  const json =
    typeof atob === "function"
      ? atob(header)
      : Buffer.from(header, "base64").toString("utf8");
  return JSON.parse(json) as X402PaymentProof;
}

export function signLabPayment(params: {
  secretKeyBase58: string;
  resource: string;
  amount: string;
  network?: string;
  /** Include when the challenge advertises payTo so verify can bind destination. */
  payTo?: string;
}): X402PaymentProof {
  const keypair = keypairFromSecret(params.secretKeyBase58);
  const payer = keypair.publicKey.toBase58();
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  const message = buildLabMessage({
    resource: params.resource,
    amount: params.amount,
    nonce,
    payer,
    timestamp,
    payTo: params.payTo,
  });
  const msgBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(msgBytes, keypair.secretKey);

  return {
    x402Version: X402_VERSION,
    scheme: X402_LAB_SCHEME,
    network: params.network ?? SOLANA_DEVNET_CAIP2,
    payload: {
      payer,
      resource: params.resource,
      amount: params.amount,
      nonce,
      timestamp,
      signature: bs58.encode(signature),
      ...(params.payTo ? { payTo: params.payTo } : {}),
    },
  };
}

export function verifyLabPayment(
  proof: X402PaymentProof,
  expected: { resource: string; amount: string; payTo?: string },
): { ok: true } | { ok: false; reason: string } {
  if (
    proof.x402Version !== X402_VERSION &&
    proof.x402Version !== X402_VERSION_LEGACY
  ) {
    return { ok: false, reason: "Unsupported x402 version" };
  }
  if (proof.scheme !== X402_LAB_SCHEME) {
    return { ok: false, reason: "Unsupported scheme for this lab" };
  }
  const networkOk =
    proof.network === SOLANA_DEVNET_CAIP2 ||
    proof.network === SOLANA_DEVNET_LEGACY;
  if (!networkOk) {
    return {
      ok: false,
      reason: `Unsupported network (expected ${SOLANA_DEVNET_CAIP2} or ${SOLANA_DEVNET_LEGACY})`,
    };
  }
  const { payload } = proof;
  if (payload.resource !== expected.resource) {
    return { ok: false, reason: "Resource mismatch" };
  }
  if (payload.amount !== expected.amount) {
    return { ok: false, reason: "Amount mismatch" };
  }
  if (!payload.nonce || typeof payload.nonce !== "string") {
    return { ok: false, reason: "Missing nonce" };
  }
  if (!Number.isFinite(payload.timestamp)) {
    return { ok: false, reason: "Invalid timestamp" };
  }
  if (Math.abs(Date.now() - payload.timestamp) > 120_000) {
    return { ok: false, reason: "Payment intent expired (timestamp)" };
  }
  if (expected.payTo) {
    if (!payload.payTo || payload.payTo !== expected.payTo) {
      return { ok: false, reason: "payTo mismatch" };
    }
  }

  const message = buildLabMessage({
    resource: payload.resource,
    amount: payload.amount,
    nonce: payload.nonce,
    payer: payload.payer,
    timestamp: payload.timestamp,
    payTo: expected.payTo ?? payload.payTo,
  });
  const msgBytes = new TextEncoder().encode(message);

  try {
    const pub = bs58.decode(payload.payer);
    const sig = bs58.decode(payload.signature);
    const valid = nacl.sign.detached.verify(msgBytes, sig, pub);
    if (!valid) return { ok: false, reason: "Invalid signature" };
  } catch {
    return { ok: false, reason: "Malformed payer or signature" };
  }

  return { ok: true };
}

export const X402_TUTORIAL_STEPS = [
  {
    id: 1,
    title: "You ask for a paid resource",
    plain: "Your app (or an AI agent) does a normal HTTP request — same as loading any API.",
    why: "No special payment channel. Money rides on the same web request/response loop the internet already uses.",
    technical: "GET /api/x402/lab with no payment headers.",
  },
  {
    id: 2,
    title: "Server answers 402 Payment Required",
    plain: "Instead of 200 OK or 401 Login, you get 402: 'Pay this amount, on this network, to this address, for this resource.'",
    why: "HTTP already reserved 402 for payments. x402 finally defines the machine-readable details so software can pay without humans filling forms.",
    technical:
      "Status 402 + v2 JSON (x402Version 2, top-level resource, accepts[] with CAIP-2 network + amount) and PAYMENT-REQUIRED header.",
  },
  {
    id: 3,
    title: "Client builds a payment",
    plain: "Your wallet signs a payment that matches the requirements — amount, destination, resource.",
    why: "Only the key holder can authorize spend. Signing proves intent without handing the server your private key.",
    technical:
      "Lab: sign a payment-intent message. Production Solana: often a signed SPL USDC transfer / partial tx for a facilitator.",
  },
  {
    id: 4,
    title: "Retry the same request with proof",
    plain: "You call the same URL again, this time attaching the payment proof in a header.",
    why: "One protocol for humans, bots, and agents: request → price → pay → unlock. No account signup required.",
    technical:
      "Header X-PAYMENT or PAYMENT-SIGNATURE carries base64 payment payload (v2).",
  },
  {
    id: 5,
    title: "Server verifies / settles, then delivers",
    plain: "The server checks the proof (itself or via a facilitator), settles on-chain if needed, and returns 200 + the goods.",
    why: "Sellers get paid per call. Buyers only pay when they need the resource. Micropayments become practical on fast, cheap chains like Solana.",
    technical: "Verify signature/tx → optional facilitator settle → reject replays (nonce/sig) → 200 + body.",
  },
] as const;

export const PREMIUM_FACTS = [
  "Solana finalizes blocks in roughly a few hundred milliseconds — fast enough that per-request micropayments feel like normal web latency.",
  "HTTP 402 existed for decades as a reserved status; x402 is the open protocol that finally standardizes what 'Payment Required' means for machines.",
  "A facilitator is an optional helper that verifies and settles payments so every API shop doesn't have to run full chain infrastructure themselves.",
  "On Solana, production x402 often moves USDC (SPL). The client authorizes a transfer; settlement can be gas-abstracted so the user may not need SOL for fees.",
  "Agents love x402 because they can discover a price, pay, and continue — no OAuth dance, no 'create an account' wall mid-task.",
  "In 2026, x402 is governed under the Linux Foundation's x402 Foundation; network IDs in v2 use CAIP-2 form (solana:… / eip155:…).",
];
