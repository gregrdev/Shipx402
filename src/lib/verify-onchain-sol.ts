import { SystemProgram } from "@solana/web3.js";
import { parseCanonicalPublicKey } from "./solana";

/**
 * Instruction-level native SOL credit for donate `onchain-sol`.
 *
 * This is NOT facilitator `exact` (USDC). We only credit a parsed
 * SystemProgram transfer (or transferWithSeed) whose destination is payTo.
 * Balance-delta alone is never enough.
 */

const SYSTEM_PROGRAM_ID = SystemProgram.programId.toBase58();

export type PubkeyLike = { toBase58(): string } | string;

export type ParsedIxLike = {
  program?: string;
  programId?: PubkeyLike;
  parsed?: {
    type?: string;
    info?: {
      source?: string;
      destination?: string;
      lamports?: number | string;
    };
  };
};

export type ParsedTxLike = {
  blockTime?: number | null;
  meta?: {
    err?: unknown;
    innerInstructions?: { instructions: ParsedIxLike[] }[] | null;
  } | null;
  transaction: {
    message: {
      accountKeys: { pubkey: PubkeyLike; signer?: boolean }[];
      instructions: ParsedIxLike[];
    };
  };
};

function pubkeyToBase58(key: PubkeyLike | undefined): string | null {
  if (key == null) return null;
  if (typeof key === "string") return key;
  try {
    return key.toBase58();
  } catch {
    return null;
  }
}

function collectInstructions(tx: ParsedTxLike): ParsedIxLike[] {
  const out: ParsedIxLike[] = [...(tx.transaction.message.instructions ?? [])];
  for (const inner of tx.meta?.innerInstructions ?? []) {
    out.push(...(inner.instructions ?? []));
  }
  return out;
}

function isSystemProgramIx(ix: ParsedIxLike): boolean {
  if (ix.program === "system") return true;
  const id = pubkeyToBase58(ix.programId);
  return id === SYSTEM_PROGRAM_ID;
}

function transferLamportsToPayTo(ix: ParsedIxLike, payTo: string): number | null {
  if (!isSystemProgramIx(ix) || !ix.parsed) return null;
  const type = ix.parsed.type;
  if (type !== "transfer" && type !== "transferWithSeed") return null;
  const dest = ix.parsed.info?.destination;
  if (dest !== payTo) return null;
  const raw = ix.parsed.info?.lamports;
  const lamports = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(lamports) || lamports <= 0) return null;
  return lamports;
}

export function feePayerFromTx(tx: ParsedTxLike): string | null {
  const keys = tx.transaction.message.accountKeys ?? [];
  const first = keys[0];
  if (first?.signer) {
    const pk = pubkeyToBase58(first.pubkey);
    if (pk) return pk;
  }
  for (const k of keys) {
    if (!k.signer) continue;
    const pk = pubkeyToBase58(k.pubkey);
    if (pk) return pk;
  }
  return null;
}

/**
 * Receipt payer is always the on-chain fee payer / first signer.
 * Client `payload.payer` is never credited; mismatch → reject.
 */
export function resolveReceiptPayer(
  onChainPayer: string | null,
  claimedPayer?: string | null,
): { ok: true; payer: string } | { ok: false; reason: string } {
  if (!onChainPayer || !parseCanonicalPublicKey(onChainPayer)) {
    return { ok: false, reason: "On-chain fee payer missing" };
  }
  if (claimedPayer != null && claimedPayer !== "") {
    if (claimedPayer !== onChainPayer) {
      return {
        ok: false,
        reason: "payload.payer does not match on-chain fee payer",
      };
    }
  }
  return { ok: true, payer: onChainPayer };
}

export function creditFromParsedTx(
  tx: ParsedTxLike,
  payTo: string,
  opts: { minLamports: number; maxAgeSeconds: number; nowSeconds?: number },
):
  | { ok: true; lamports: number; payer: string }
  | { ok: false; reason: string } {
  if (tx.meta?.err) {
    return { ok: false, reason: "Transaction failed on-chain" };
  }

  const blockTime = tx.blockTime;
  if (!Number.isFinite(blockTime)) {
    return { ok: false, reason: "Transaction blockTime missing (fail-closed)" };
  }
  const now = opts.nowSeconds ?? Date.now() / 1000;
  if (now - (blockTime as number) > opts.maxAgeSeconds) {
    return { ok: false, reason: "Transaction is too old to credit" };
  }

  let received = 0;
  for (const ix of collectInstructions(tx)) {
    const lamports = transferLamportsToPayTo(ix, payTo);
    if (lamports != null) received += lamports;
  }
  if (received < opts.minLamports) {
    return {
      ok: false,
      reason: `No SystemProgram transfer to payTo meeting minimum (${received} lamports; min ${opts.minLamports})`,
    };
  }

  const payer = feePayerFromTx(tx);
  if (!payer) {
    return { ok: false, reason: "On-chain fee payer missing" };
  }
  return { ok: true, lamports: received, payer };
}
