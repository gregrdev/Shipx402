import { createFileRoute } from "@tanstack/react-router";
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";
import { rejectMethods } from "@/lib/http";
import {
  DONATION_ADDRESS,
  DONATION_CUSTOMARY_TIP_SOL,
  DONATION_GENEROUS_THRESHOLD_SOL,
  DONATION_MAX_AGE_SECONDS,
  DONATION_MIN_LAMPORTS,
  DONATION_MIN_SOL,
  DONATION_RESOURCE_PATH,
  DONATION_TIP_SUGGESTED_SOL,
  donationThankYouCopy,
  isDonationAddressConfigured,
} from "@/lib/donate";
import {
  X402_CORS_ALLOW_HEADERS,
  X402_CORS_EXPOSE_HEADERS,
  X402_HEADER,
  getPaymentSignatureHeader,
} from "@/lib/x402-headers";

/**
 * Real x402-style donation endpoint.
 *
 * Unlike the lab (signed intent, no money moves), this endpoint verifies an
 * ACTUAL mainnet SOL transfer to DONATION_ADDRESS before returning the thanks
 * receipt. Scheme "onchain-sol": the payer settles the transfer themselves and
 * submits the transaction signature as proof — no facilitator needed.
 *
 * Flow for agents:
 *   1. GET /api/x402/donate            -> HTTP 402 + requirements (payTo, min)
 *   2. Send >= minimum SOL to payTo on Solana mainnet (any wallet/SDK)
 *   3. Retry with header PAYMENT-SIGNATURE: base64(JSON proof, see 402 body `extra`)
 *      (legacy V1 alias X-PAYMENT is still accepted)
 *   4. Server verifies the tx on-chain -> 200 + receipt
 *
 * To upgrade to spec-standard x402 v2 with USDC + a facilitator later, see the
 * `x402-solana` npm package + a public facilitator (e.g. PayAI or Coinbase CDP).
 */

const RPC_URL =
  typeof process !== "undefined" && process.env.SOLANA_RPC_URL
    ? process.env.SOLANA_RPC_URL
    : clusterApiUrl("mainnet-beta");

/**
 * CAIP-2 network identifier for Solana mainnet, per the x402 v2 spec
 * (specs/x402-specification-v2.md, section 11.1). We advertise this in the
 * v2-shaped challenge while still accepting the legacy "solana" value on
 * inbound proofs for backward compatibility.
 */
const SOLANA_MAINNET_CAIP2 = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";

type DonationProof = {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    /** Base58 transaction signature of the on-chain SOL transfer. */
    signature: string;
    /** Optional: payer public key, echoed back in the receipt. */
    payer?: string;
  };
};

/**
 * Replay guard: signatures already credited this server session.
 * In-memory on purpose (donations receipts are low-stakes); swap for a DB row
 * if you ever gate real content behind this endpoint.
 */
const creditedSignatures = new Map<string, number>();
const CREDITED_CAP = 5000;

function pruneCredited() {
  if (creditedSignatures.size <= CREDITED_CAP) return;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [sig, at] of creditedSignatures) {
    if (at < cutoff) creditedSignatures.delete(sig);
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

/**
 * Build the 402 challenge in the x402 v2 shape (specs/x402-specification-v2.md):
 * top-level `resource` ResourceInfo object, per-requirement `amount`, CAIP-2
 * `network`, and `extensions`. We keep the custom `onchain-sol` scheme because
 * this is a self-settled native-SOL donation, not the standard facilitator
 * `exact` flow — so a standards-only client will (correctly) decline to auto-pay,
 * while any client can still implement the documented flow in `extra.how`.
 *
 * Backward compatibility: we also mirror the legacy v1 fields
 * (`maxAmountRequired`, per-item `resource`/`description`) inside the accepts
 * entry, so older v1-aware readers keep working. The inbound proof handler
 * accepts both the legacy "solana" network id and the CAIP-2 form.
 */
function buildRequirements() {
  return {
    x402Version: 2,
    error: "Payment required — this endpoint accepts real SOL donations",
    resource: {
      url: DONATION_RESOURCE_PATH,
      description:
        "Support Ship x402. Send SOL on mainnet, then retry with proof.",
      mimeType: "application/json",
    },
    accepts: [
      {
        scheme: "onchain-sol",
        network: SOLANA_MAINNET_CAIP2,
        amount: String(DONATION_MIN_LAMPORTS),
        asset: "SOL",
        payTo: DONATION_ADDRESS,
        maxTimeoutSeconds: DONATION_MAX_AGE_SECONDS,
        // --- legacy v1 mirror (harmless for v2 readers, keeps v1 clients working) ---
        maxAmountRequired: String(DONATION_MIN_LAMPORTS),
        resource: DONATION_RESOURCE_PATH,
        description:
          "Support Ship x402. Send SOL on mainnet, then retry with proof.",
        mimeType: "application/json",
        extra: {
          required: false,
          tipSuggestedSol: [...DONATION_TIP_SUGGESTED_SOL],
          customaryTipSol: DONATION_CUSTOMARY_TIP_SOL,
          generousAboveSol: DONATION_GENEROUS_THRESHOLD_SOL,
          how: `Transfer >= ${DONATION_MIN_SOL} SOL to payTo on Solana mainnet, then retry this URL with header PAYMENT-SIGNATURE (canonical V2; legacy X-PAYMENT also accepted): base64 of {"x402Version":2,"scheme":"onchain-sol","network":"${SOLANA_MAINNET_CAIP2}","payload":{"signature":"<tx signature>","payer":"<your pubkey>"}}`,
          note: "Settlement is the transfer itself — the server verifies your transaction on-chain. Tips are optional. Suggested range: 0.01–0.25 SOL; amounts above 0.25 SOL receive a special thank-you recognition. Custom scheme (not the standard 'exact' facilitator flow); legacy network id 'solana' and x402Version 1 are also accepted on the proof for compatibility.",
        },
      },
    ],
    extensions: {},
    why: "Donations keep this tutorial free. Same 402 loop you learned in the lab — but this one settles real value.",
  };
}

async function verifyOnChain(signature: string): Promise<
  | { ok: true; lamports: number; payer: string | null }
  | { ok: false; reason: string }
> {
  // Base58 sanity: Solana signatures are 64 bytes.
  let sigBytes: Uint8Array;
  try {
    sigBytes = bs58.decode(signature);
  } catch {
    return { ok: false, reason: "Signature is not valid base58" };
  }
  if (sigBytes.length !== 64) {
    return { ok: false, reason: "Signature must decode to 64 bytes" };
  }

  const connection = new Connection(RPC_URL, "confirmed");
  const tx = await connection.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });

  if (!tx) {
    return {
      ok: false,
      reason:
        "Transaction not found (not yet confirmed, wrong network, or bad signature). Wait a few seconds and retry.",
    };
  }
  if (tx.meta?.err) {
    return { ok: false, reason: "Transaction failed on-chain" };
  }
  if (
    typeof tx.blockTime === "number" &&
    Date.now() / 1000 - tx.blockTime > DONATION_MAX_AGE_SECONDS
  ) {
    return { ok: false, reason: "Transaction is too old to credit" };
  }

  const keys = tx.transaction.message.accountKeys;
  const donationIndex = keys.findIndex(
    (k) => k.pubkey.toBase58() === DONATION_ADDRESS,
  );
  if (donationIndex === -1 || !tx.meta) {
    return { ok: false, reason: "Transaction does not touch the donation address" };
  }

  const pre = tx.meta.preBalances[donationIndex] ?? 0;
  const post = tx.meta.postBalances[donationIndex] ?? 0;
  const received = post - pre;
  if (received < DONATION_MIN_LAMPORTS) {
    return {
      ok: false,
      reason: `Donation address received ${received} lamports; minimum is ${DONATION_MIN_LAMPORTS}`,
    };
  }

  const payer = keys.find((k) => k.signer)?.pubkey.toBase58() ?? null;
  return { ok: true, lamports: received, payer };
}

export const Route = createFileRoute("/api/x402/donate")({
  server: {
    handlers: {
      ...rejectMethods(["GET", "OPTIONS"], ["POST", "PUT", "PATCH", "DELETE"]),
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
        if (!isDonationAddressConfigured()) {
          return json(
            {
              error: "Donation address not configured",
              hint: "Site owner: set DONATION_ADDRESS in src/lib/donate.ts to your mainnet public address.",
            },
            503,
          );
        }

        const paymentHeader = getPaymentSignatureHeader(request);

        if (!paymentHeader) {
          return json(buildRequirements(), 402, {
            [X402_HEADER.required]: Buffer.from(
              JSON.stringify(buildRequirements()),
              "utf8",
            ).toString("base64"),
          });
        }

        let proof: DonationProof;
        try {
          const raw =
            typeof atob === "function"
              ? atob(paymentHeader)
              : Buffer.from(paymentHeader, "base64").toString("utf8");
          proof = JSON.parse(raw) as DonationProof;
        } catch {
          return json({ error: "Malformed PAYMENT-SIGNATURE header" }, 400);
        }

        if (
          proof.x402Version !== 2 &&
          proof.x402Version !== 1
        ) {
          return json(
            {
              error: "Payment verification failed",
              reason: "Unsupported x402Version",
            },
            402,
          );
        }

        // Accept the custom scheme, and either the legacy "solana" network id
        // or the CAIP-2 form advertised in the v2 challenge.
        const networkOk =
          proof.network === "solana" || proof.network === SOLANA_MAINNET_CAIP2;
        if (proof.scheme !== "onchain-sol" || !networkOk) {
          return json(
            {
              error: "Payment verification failed",
              reason: "Unsupported scheme/network — see the 402 requirements",
            },
            402,
          );
        }
        const signature = proof.payload?.signature;
        if (!signature || typeof signature !== "string") {
          return json(
            { error: "Payment verification failed", reason: "Missing signature" },
            402,
          );
        }
        if (creditedSignatures.has(signature)) {
          return json(
            {
              error: "Payment verification failed",
              reason: "This transaction was already credited",
            },
            402,
          );
        }

        try {
          const result = await verifyOnChain(signature);
          if (!result.ok) {
            return json(
              {
                error: "Payment verification failed",
                reason: result.reason,
                hint: "Confirm the transfer landed on mainnet to the payTo address, then retry.",
              },
              402,
            );
          }

          creditedSignatures.set(signature, Date.now());
          pruneCredited();

          const amountSol = result.lamports / LAMPORTS_PER_SOL;
          const thanks = donationThankYouCopy(amountSol);

          const receipt = {
            success: true,
            scheme: "onchain-sol",
            network: SOLANA_MAINNET_CAIP2,
            signature,
            payer: proof.payload.payer ?? result.payer,
            amountSol,
            settledAt: new Date().toISOString(),
            mode: "onchain-verified",
            recognition: thanks.recognition,
          };

          return json(
            {
              ok: true,
              resource: DONATION_RESOURCE_PATH,
              title: thanks.title,
              message: thanks.message,
              recognition: thanks.recognition,
              payment: receipt,
            },
            200,
            {
              [X402_HEADER.response]: Buffer.from(
                JSON.stringify(receipt),
                "utf8",
              ).toString("base64"),
              [X402_HEADER.responseLegacy]: Buffer.from(
                JSON.stringify(receipt),
                "utf8",
              ).toString("base64"),
            },
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "RPC verification error";
          return json(
            {
              error: "Could not verify on-chain",
              reason: message,
              hint: "Public RPC may be rate-limited. Retry shortly, or the site owner can set SOLANA_RPC_URL to a dedicated endpoint.",
            },
            502,
          );
        }
      },
    },
  },
});
