import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Keypair } from "@solana/web3.js";
import { isPrivateIp, mappedIpv4FromV6 } from "./private-ip";
import {
  isOnCurveWalletAddress,
  isCanonicalSolanaAddress,
  generateWallet,
} from "./solana";
import { isDonationAddressConfigured, DONATION_ADDRESS } from "./donate";
import { encodeSolanaPayUrl } from "./solana-pay";
import {
  creditFromParsedTx,
  resolveReceiptPayer,
  type ParsedTxLike,
} from "./verify-onchain-sol";
import { signLabPayment, verifyLabPayment, X402_LAB_SCHEME } from "./x402";
import { claimDonationSignatureOnce } from "./credited-sig-store";
import { X402_CORS_EXPOSE_HEADERS } from "./http";

const PAY_TO = DONATION_ADDRESS;
const PAYER = generateWallet().publicKey;

function transferTx(opts: {
  payTo: string;
  lamports: number;
  payer: string;
  blockTime: number | null;
  inner?: boolean;
  extraIx?: ParsedTxLike["transaction"]["message"]["instructions"][number];
}): ParsedTxLike {
  const transferIx = {
    program: "system",
    programId: "11111111111111111111111111111111",
    parsed: {
      type: "transfer" as const,
      info: {
        source: opts.payer,
        destination: opts.payTo,
        lamports: opts.lamports,
      },
    },
  };
  return {
    blockTime: opts.blockTime,
    meta: {
      err: null,
      innerInstructions: opts.inner ? [{ instructions: [transferIx] }] : [],
    },
    transaction: {
      message: {
        accountKeys: [{ pubkey: opts.payer, signer: true }],
        instructions: opts.inner ? (opts.extraIx ? [opts.extraIx] : []) : [transferIx],
      },
    },
  };
}

test("isPrivateIp classifies ::ffff: mapped IPv4 (not :ffff: bug)", () => {
  assert.equal(mappedIpv4FromV6("::ffff:127.0.0.1"), "127.0.0.1");
  assert.equal(mappedIpv4FromV6("::ffff:192.168.1.10"), "192.168.1.10");
  assert.equal(mappedIpv4FromV6("::ffff:8.8.8.8"), "8.8.8.8");
  assert.equal(isPrivateIp("::ffff:127.0.0.1"), true);
  assert.equal(isPrivateIp("::ffff:10.0.0.1"), true);
  assert.equal(isPrivateIp("::ffff:192.168.0.5"), true);
  assert.equal(isPrivateIp("::ffff:8.8.8.8"), false);
  // The old bug used startsWith(":ffff:") which never matched Node's form.
  assert.equal("::ffff:127.0.0.1".startsWith(":ffff:"), false);
  assert.equal("::ffff:127.0.0.1".startsWith("::ffff:"), true);
});

test("isPrivateIp fail-closed on unknown forms", () => {
  assert.equal(isPrivateIp("not-an-ip"), true);
  assert.equal(isPrivateIp("::1"), true);
  assert.equal(isPrivateIp("fe80::1"), true);
  assert.equal(isPrivateIp("fc00::1"), true);
  assert.equal(isPrivateIp("2001:4860:4860::8888"), false);
});

test("donation address gate is PublicKey + on-curve, not regex-only", () => {
  assert.equal(isDonationAddressConfigured(DONATION_ADDRESS), true);
  assert.equal(isOnCurveWalletAddress(DONATION_ADDRESS), true);
  // System Program is a valid pubkey; the old regex also accepted garbage
  // that PublicKey rejects — that is the gate we dropped.
  assert.equal(isCanonicalSolanaAddress("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"), false);
  assert.equal(isOnCurveWalletAddress("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"), false);
  assert.equal(isDonationAddressConfigured("not-a-key"), false);
  assert.equal(isDonationAddressConfigured("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"), false);
  // Old donate gate was charset/length only and would have accepted this.
  assert.equal(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"), true);
});

test("encodeSolanaPayUrl validates recipient PublicKey", () => {
  const url = encodeSolanaPayUrl({
    recipient: DONATION_ADDRESS,
    token: "SOL",
    network: "mainnet-beta",
    amount: 0.05,
  });
  assert.ok(url.startsWith(`solana:${DONATION_ADDRESS}`));
  assert.throws(
    () =>
      encodeSolanaPayUrl({
        recipient: "not-a-pubkey",
        token: "SOL",
        network: "mainnet-beta",
      }),
    /valid public key/,
  );
});

test("creditFromParsedTx requires SystemProgram transfer to payTo and blockTime", () => {
  const now = 1_700_000_000;
  const ok = creditFromParsedTx(
    transferTx({
      payTo: PAY_TO,
      lamports: 1_000_000,
      payer: PAYER,
      blockTime: now - 10,
    }),
    PAY_TO,
    { minLamports: 1_000_000, maxAgeSeconds: 45 * 60, nowSeconds: now },
  );
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.payer, PAYER);
    assert.equal(ok.lamports, 1_000_000);
  }

  const missingTime = creditFromParsedTx(
    transferTx({
      payTo: PAY_TO,
      lamports: 1_000_000,
      payer: PAYER,
      blockTime: null,
    }),
    PAY_TO,
    { minLamports: 1_000_000, maxAgeSeconds: 45 * 60, nowSeconds: now },
  );
  assert.equal(missingTime.ok, false);

  const wrongDest = creditFromParsedTx(
    transferTx({
      payTo: generateWallet().publicKey,
      lamports: 5_000_000,
      payer: PAYER,
      blockTime: now - 10,
    }),
    PAY_TO,
    { minLamports: 1_000_000, maxAgeSeconds: 45 * 60, nowSeconds: now },
  );
  assert.equal(wrongDest.ok, false);
});

test("creditFromParsedTx does not credit balance-delta without a matching instruction", () => {
  const now = 1_700_000_000;
  const tx: ParsedTxLike = {
    blockTime: now - 5,
    meta: { err: null, innerInstructions: [] },
    transaction: {
      message: {
        accountKeys: [
          { pubkey: PAYER, signer: true },
          { pubkey: PAY_TO, signer: false },
        ],
        instructions: [
          {
            program: "spl-token",
            parsed: {
              type: "transfer",
              info: { destination: PAY_TO, lamports: 9_000_000 },
            },
          },
        ],
      },
    },
  };
  const result = creditFromParsedTx(tx, PAY_TO, {
    minLamports: 1_000_000,
    maxAgeSeconds: 45 * 60,
    nowSeconds: now,
  });
  assert.equal(result.ok, false);
});

test("resolveReceiptPayer ignores client payload and rejects mismatch", () => {
  const onChain = PAYER;
  const ok = resolveReceiptPayer(onChain, undefined);
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.payer, onChain);

  const echoed = resolveReceiptPayer(onChain, onChain);
  assert.equal(echoed.ok, true);

  const fake = generateWallet().publicKey;
  const mismatch = resolveReceiptPayer(onChain, fake);
  assert.equal(mismatch.ok, false);

  const missing = resolveReceiptPayer(null, fake);
  assert.equal(missing.ok, false);
  if (!missing.ok) {
    assert.equal(missing.reason.includes("fee payer"), true);
  }
});

test("verifyLabPayment rejects non-finite timestamp and binds payTo", () => {
  const wallet = generateWallet();
  const payTo = Keypair.generate().publicKey.toBase58();
  const proof = signLabPayment({
    secretKeyBase58: wallet.secretKey,
    resource: "/api/x402/lab",
    amount: "1000",
    payTo,
  });
  const good = verifyLabPayment(proof, {
    resource: "/api/x402/lab",
    amount: "1000",
    payTo,
  });
  assert.equal(good.ok, true);

  const badPayTo = verifyLabPayment(proof, {
    resource: "/api/x402/lab",
    amount: "1000",
    payTo: Keypair.generate().publicKey.toBase58(),
  });
  assert.equal(badPayTo.ok, false);

  const tampered = structuredClone(proof);
  tampered.payload.timestamp = Number.NaN;
  const expired = verifyLabPayment(tampered, {
    resource: "/api/x402/lab",
    amount: "1000",
    payTo,
  });
  assert.equal(expired.ok, false);
  if (!expired.ok) assert.equal(expired.reason, "Invalid timestamp");

  const missing = structuredClone(proof);
  // @ts-expect-error testing JSON-like garbage
  missing.payload.timestamp = "now";
  const notNumber = verifyLabPayment(missing, {
    resource: "/api/x402/lab",
    amount: "1000",
    payTo,
  });
  assert.equal(notNumber.ok, false);

  assert.equal(proof.scheme, X402_LAB_SCHEME);
});

test("claimDonationSignatureOnce is durable single-use on filesystem", async () => {
  const dir = mkdtempSync(join(tmpdir(), "shipx402-sigs-"));
  const prevPath = process.env.CREDITED_SIG_PATH;
  const prevKv = process.env.KV_REST_API_URL;
  const prevUpstash = process.env.UPSTASH_REDIS_REST_URL;
  process.env.CREDITED_SIG_PATH = dir;
  delete process.env.KV_REST_API_URL;
  delete process.env.UPSTASH_REDIS_REST_URL;
  try {
    const sig = "2n".repeat(32);
    const first = await claimDonationSignatureOnce(sig);
    assert.equal(first, "ok");
    const second = await claimDonationSignatureOnce(sig);
    assert.equal(second, "duplicate");
  } finally {
    if (prevPath === undefined) delete process.env.CREDITED_SIG_PATH;
    else process.env.CREDITED_SIG_PATH = prevPath;
    if (prevKv === undefined) delete process.env.KV_REST_API_URL;
    else process.env.KV_REST_API_URL = prevKv;
    if (prevUpstash === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = prevUpstash;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CORS expose list includes Payment-Required twins so browser JS can read 402 challenge", () => {
  assert.match(X402_CORS_EXPOSE_HEADERS, /\bPAYMENT-REQUIRED\b/);
  assert.match(X402_CORS_EXPOSE_HEADERS, /\bPayment-Required\b/);
  assert.match(X402_CORS_EXPOSE_HEADERS, /\bX-PAYMENT-RESPONSE\b/);
  assert.match(X402_CORS_EXPOSE_HEADERS, /\bPAYMENT-RESPONSE\b/);
});
