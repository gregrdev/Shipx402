import { createFileRoute } from "@tanstack/react-router";
import {
  X402_LAB_AMOUNT,
  X402_RESOURCE_PATH,
  createPaymentRequirements,
  decodeXPaymentHeader,
  PREMIUM_FACTS,
  verifyLabPayment,
} from "@/lib/x402";
import {
  X402_CORS_ALLOW_HEADERS,
  X402_CORS_EXPOSE_HEADERS,
  X402_HEADER,
  getPaymentSignatureHeader,
} from "@/lib/x402-headers";

/**
 * Example merchant wallet for the lab (valid base58 pubkey).
 * Not a real treasury — lab payments are signed intents only, not on-chain transfers.
 * Generated once for the tutorial so learners see a wallet-shaped address, not a program id.
 */
const LAB_PAY_TO = "DEUuczkZU3Mj9Jf62LTLKSKi54WvBSFwiYmEnKyJszvu";

/** Teach replay protection: one nonce may unlock only once per server process. */
const seenNonces = new Set<string>();
const NONCE_CAP = 5000;

function rememberNonce(nonce: string) {
  seenNonces.add(nonce);
  if (seenNonces.size > NONCE_CAP) {
    let i = 0;
    for (const n of seenNonces) {
      seenNonces.delete(n);
      if (++i >= NONCE_CAP / 2) break;
    }
  }
}

function json(data: unknown, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": X402_CORS_ALLOW_HEADERS,
      "access-control-expose-headers": X402_CORS_EXPOSE_HEADERS,
      ...headers,
    },
  });
}

import { rejectMethods } from "@/lib/http";

export const Route = createFileRoute("/api/x402/lab")({
  server: {
    handlers: {
      ...rejectMethods(["GET","OPTIONS"], ["POST","PUT","PATCH","DELETE"]),
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, OPTIONS",
            "access-control-allow-headers": X402_CORS_ALLOW_HEADERS,
          },
        }),

      GET: async ({ request }) => {
        const paymentHeader = getPaymentSignatureHeader(request);

        if (!paymentHeader) {
          const requirements = createPaymentRequirements(LAB_PAY_TO);
          // Label for sharp learners reading the 402 body
          if (requirements.accepts[0]) {
            requirements.accepts[0] = {
              ...requirements.accepts[0],
              extra: {
                ...requirements.accepts[0].extra,
                payToLabel:
                  "Example merchant wallet (lab only — no on-chain settlement)",
              },
            };
          }
          return json(
            requirements,
            402,
            {
              [X402_HEADER.required]: Buffer.from(
                JSON.stringify(requirements),
                "utf8",
              ).toString("base64"),
            },
          );
        }

        try {
          const proof = decodeXPaymentHeader(paymentHeader);
          const result = verifyLabPayment(proof, {
            resource: X402_RESOURCE_PATH,
            amount: X402_LAB_AMOUNT,
          });

          if (!result.ok) {
            return json(
              {
                error: "Payment verification failed",
                reason: result.reason,
                hint: "Rebuild the payment from the 402 requirements and retry.",
              },
              402,
            );
          }

          if (seenNonces.has(proof.payload.nonce)) {
            return json(
              {
                error: "Payment verification failed",
                reason: "Replay rejected — this nonce was already used",
                hint: "Sign a fresh payment intent (new nonce) for each request. Production x402 also prevents reuse.",
              },
              402,
            );
          }
          rememberNonce(proof.payload.nonce);

          const dayIndex =
            Math.floor(Date.now() / 86_400_000) % PREMIUM_FACTS.length;
          const fact = PREMIUM_FACTS[dayIndex]!;

          const paymentResponse = {
            success: true,
            scheme: proof.scheme,
            network: proof.network,
            payer: proof.payload.payer,
            amount: proof.payload.amount,
            nonce: proof.payload.nonce,
            settledAt: new Date().toISOString(),
            mode: "lab-signature",
            x402Version: proof.x402Version,
            note: "Lab settlement is a verified signed intent (no on-chain USDC). Nonce is single-use (replay protection). Challenge is v2-shaped (CAIP-2 + top-level resource).",
          };

          return json(
            {
              ok: true,
              resource: X402_RESOURCE_PATH,
              title: "Premium unlock successful",
              fact,
              whyYouGotThis:
                "You completed the x402 loop: 402 + PAYMENT-REQUIRED → signed payment → retry with PAYMENT-SIGNATURE → 200 + PAYMENT-RESPONSE.",
              payment: paymentResponse,
            },
            200,
            {
              [X402_HEADER.response]: Buffer.from(
                JSON.stringify(paymentResponse),
                "utf8",
              ).toString("base64"),
              [X402_HEADER.responseLegacy]: Buffer.from(
                JSON.stringify(paymentResponse),
                "utf8",
              ).toString("base64"),
            },
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Invalid payment header";
          return json({ error: "Malformed PAYMENT-SIGNATURE header", message }, 400);
        }
      },
    },
  },
});
