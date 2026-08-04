import { createFileRoute } from "@tanstack/react-router";
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";
import {
  DONATION_ADDRESS,
  DONATION_MAX_AGE_SECONDS,
  DONATION_MIN_LAMPORTS,
  DONATION_MIN_SOL,
  DONATION_RESOURCE_PATH,
  isDonationAddressConfigured,
} from "@/lib/donate";

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
 *   3. Retry with header X-PAYMENT: base64(JSON proof, see 402 body `extra`)
 *   4. Server verifies the tx on-chain -> 200 + receipt
 *
 * To upgrade to spec-standard x402 v2 with USDC + a facilitator later, see the
 * `x402-solana` npm package + a public facilitator (e.g. PayAI or Coinbase CDP).
 */

const RPC_URL =
  typeof process !== "undefined" && process.env.SOLANA_RPC_URL
    ? process.env.SOLANA_RPC_URL
    : clusterApiUrl("mainnet-beta");

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
      "access-control-allow-headers": "Content-Type, X-PAYMENT",
      "access-control-expose-headers": "X-PAYMENT-RESPONSE",
      ...headers,
    },
  });
}

function buildRequirements() {
  return {
    x402Version: 1,
    error: "Payment required — this endpoint accepts real SOL donations",
    accepts: [
      {
        scheme: "onchain-sol",
        network: "solana",
        maxAmountRequired: String(DONATION_MIN_LAMPORTS),
        resource: DONATION_RESOURCE_PATH,
        description:
          "Support Ship x402. Send SOL on mainnet, then retry with proof.",
        mimeType: "application/json",
        payTo: DONATION_ADDRESS,
        maxTimeoutSeconds: DONATION_MAX_AGE_SECONDS,
        asset: "SOL",
        extra: {
          how: `Transfer >= ${DONATION_MIN_SOL} SOL to payTo on Solana mainnet, then retry this URL with header X-PAYMENT: base64 of {"x402Version":1,"scheme":"onchain-sol","network":"solana","payload":{"signature":"<tx signature>","payer":"<your pubkey>"}}`,
          note: "Settlement is the transfer itself — the server verifies your transaction on-chain. Amounts above the minimum are welcome.",
        },
      },
    ],
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
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, OPTIONS",
            "access-control-allow-headers": "Content-Type, X-PAYMENT",
          },
        }),

      GET: async ({ request }) => {
        if (!isDonationAddressConfigured()) {
          return json(
            {
              error: "Donations not configured",
              hint: "Site owner: set DONATION_ADDRESS in src/lib/donate.ts to your mainnet public address.",
            },
            503,
          );
        }

        const paymentHeader =
          request.headers.get("x-payment") ?? request.headers.get("X-PAYMENT");

        if (!paymentHeader) {
          const requirements = buildRequirements();
          return json(requirements, 402, {
            "PAYMENT-REQUIRED": Buffer.from(
              JSON.stringify(requirements),
              "utf8",
            ).toString("base64"),
          });
        }

        let proof: DonationProof;
        try {
          proof = JSON.parse(
            Buffer.from(paymentHeader, "base64").toString("utf8"),
          ) as DonationProof;
        } catch {
          return json({ error: "Malformed X-PAYMENT header" }, 400);
        }

        if (proof.scheme !== "onchain-sol" || proof.network !== "solana") {
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

          const receipt = {
            success: true,
            scheme: "onchain-sol",
            network: "solana",
            signature,
            payer: proof.payload.payer ?? result.payer,
            amountSol: result.lamports / LAMPORTS_PER_SOL,
            settledAt: new Date().toISOString(),
            mode: "onchain-verified",
          };

          return json(
            {
              ok: true,
              resource: DONATION_RESOURCE_PATH,
              title: "Thank you for supporting Ship x402",
              message:
                "Your on-chain donation was verified. Real x402, real value — you just did in production what the lab taught.",
              payment: receipt,
            },
            200,
            {
              "X-PAYMENT-RESPONSE": Buffer.from(
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
