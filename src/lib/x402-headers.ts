/**
 * Official x402 V2 HTTP header names (docs.x402.org / x402-foundation HTTP transport).
 *
 * Canonical wire locations (V2):
 * - PAYMENT-REQUIRED  — server → client, base64 PaymentRequired (402)
 * - PAYMENT-SIGNATURE — client → server, base64 PaymentPayload (retry)
 * - PAYMENT-RESPONSE  — server → client, base64 SettlementResponse (settle)
 *
 * Legacy V1 names (still accepted during migration; do not teach as current):
 * - X-PAYMENT / X-PAYMENT-RESPONSE
 *
 * Source: https://docs.x402.org/core-concepts/http-402
 * Spec:   https://github.com/x402-foundation/x402/blob/main/specs/transports-v2/http.md
 */

export const X402_HEADER = {
  required: "PAYMENT-REQUIRED",
  signature: "PAYMENT-SIGNATURE",
  response: "PAYMENT-RESPONSE",
  signatureLegacy: "X-PAYMENT",
  responseLegacy: "X-PAYMENT-RESPONSE",
} as const;

/** CORS Allow-Headers: V2 first, then legacy V1 aliases. */
export const X402_CORS_ALLOW_HEADERS =
  "Content-Type, PAYMENT-SIGNATURE, PAYMENT-REQUIRED, X-PAYMENT";

/** CORS Expose-Headers: V2 settlement + challenge, then legacy V1 alias. */
export const X402_CORS_EXPOSE_HEADERS =
  "PAYMENT-REQUIRED, PAYMENT-RESPONSE, X-PAYMENT-RESPONSE";

/** Read the client payment proof. Prefer V2 PAYMENT-SIGNATURE; accept legacy X-PAYMENT. */
export function getPaymentSignatureHeader(request: { headers: Headers }): string | null {
  return (
    request.headers.get(X402_HEADER.signature) ||
    request.headers.get(X402_HEADER.signatureLegacy)
  );
}
