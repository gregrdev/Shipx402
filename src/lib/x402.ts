/**
 * Educational x402 helpers for Ship x402 Lab.
 *
 * Real production x402 (x402 Foundation / Coinbase CDP / public facilitators)
 * often uses headers like PAYMENT-REQUIRED / PAYMENT-SIGNATURE / PAYMENT-RESPONSE.
 * Solana native examples commonly use HTTP 402 body + X-PAYMENT retry.
 *
 * This lab implements a simplified, fully working "exact-lab" scheme so you can
 * experience the 402 → pay → retry loop without needing mainnet USDC.
 */

import bs58 from "bs58";
import nacl from "tweetnacl";
import { keypairFromSecret } from "./solana";

export const X402_VERSION = 1;
export const X402_LAB_SCHEME = "exact-lab";
export const X402_RESOURCE_PATH = "/api/x402/lab";

export const X402_LAB_PRICE_LABEL = "0.001 USDC-equivalent (lab units)";
export const X402_LAB_AMOUNT = "1000";

export type X402PaymentRequirements = {
  x402Version: number;
  error: string;
  accepts: Array<{
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra?: Record<string, string>;
  }>;
  why: string;
};

export type X402LabPayload = {
  payer: string;
  resource: string;
  amount: string;
  nonce: string;
  timestamp: number;
  signature: string;
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
}) {
  return [
    "x402-lab-v1",
    parts.resource,
    parts.amount,
    parts.nonce,
    parts.payer,
    String(parts.timestamp),
  ].join(":");
}

export function createPaymentRequirements(payTo: string): X402PaymentRequirements {
  return {
    x402Version: X402_VERSION,
    error: "Payment required to access this resource",
    accepts: [
      {
        scheme: X402_LAB_SCHEME,
        network: "solana-devnet",
        maxAmountRequired: X402_LAB_AMOUNT,
        resource: X402_RESOURCE_PATH,
        description: "Premium Solana fact of the day (Ship x402 x402 lab)",
        mimeType: "application/json",
        payTo,
        maxTimeoutSeconds: 120,
        asset: "lab-usdc",
        extra: {
          note: "Lab scheme: sign a payment intent with your wallet. Production often settles USDC via a facilitator (Coinbase CDP, PayAI, etc.).",
          humanPrice: X402_LAB_PRICE_LABEL,
          caip2Hint: "Production network IDs often use CAIP-2 (e.g. solana:…).",
        },
      },
    ],
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
  });
  const msgBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(msgBytes, keypair.secretKey);

  return {
    x402Version: X402_VERSION,
    scheme: X402_LAB_SCHEME,
    network: params.network ?? "solana-devnet",
    payload: {
      payer,
      resource: params.resource,
      amount: params.amount,
      nonce,
      timestamp,
      signature: bs58.encode(signature),
    },
  };
}

export function verifyLabPayment(
  proof: X402PaymentProof,
  expected: { resource: string; amount: string },
): { ok: true } | { ok: false; reason: string } {
  if (proof.x402Version !== X402_VERSION) {
    return { ok: false, reason: "Unsupported x402 version" };
  }
  if (proof.scheme !== X402_LAB_SCHEME) {
    return { ok: false, reason: "Unsupported scheme for this lab" };
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
  if (Math.abs(Date.now() - payload.timestamp) > 120_000) {
    return { ok: false, reason: "Payment intent expired (timestamp)" };
  }

  const message = buildLabMessage({
    resource: payload.resource,
    amount: payload.amount,
    nonce: payload.nonce,
    payer: payload.payer,
    timestamp: payload.timestamp,
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
    technical: "Status 402 + JSON requirements (price, asset, network, payTo, scheme).",
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
    technical: "Header X-PAYMENT (or PAYMENT-SIGNATURE in CDP-style stacks) carries base64 payment payload.",
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
  "In 2026, x402 is governed under the Linux Foundation's x402 Foundation; network IDs in v2 often use CAIP-2 form.",
];
