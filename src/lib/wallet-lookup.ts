import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
  type ConfirmedSignatureInfo,
  type ParsedTransactionWithMeta,
} from "@solana/web3.js";
import type { NetworkMode } from "./solana";

export type WalletTxRow = {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: unknown;
  memo: string | null;
  /** Approximate net SOL change for this address (signed). Null if unknown. */
  solDelta: number | null;
  status: "success" | "failed";
  explorerUrl: string;
};

export type WalletLookupResult = {
  address: string;
  network: NetworkMode;
  balanceSol: number;
  balanceLamports: number;
  solUsd: number | null;
  valueUsd: number | null;
  priceSource: string | null;
  transactionCountHint: number;
  transactions: WalletTxRow[];
  fetchedAt: string;
};

export function isLookupAddress(address: string): boolean {
  try {
    // Accept any base58 pubkey (including program-derived), not only on-curve.
    new PublicKey(address.trim());
    return true;
  } catch {
    return false;
  }
}

function rpcUrl(network: NetworkMode): string {
  if (typeof process !== "undefined" && process.env.SOLANA_RPC_URL) {
    const u = process.env.SOLANA_RPC_URL.trim();
    if (u) {
      if (network === "mainnet-beta") return u;
      if (network === "devnet" && /devnet/i.test(u)) return u;
    }
  }
  return clusterApiUrl(network === "devnet" ? "devnet" : "mainnet-beta");
}

export function explorerAddressUrl(address: string, network: NetworkMode) {
  const cluster = network === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

export function explorerTxUrl(signature: string, network: NetworkMode) {
  const cluster = network === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

let priceCache: { usd: number; at: number } | null = null;
const PRICE_TTL_MS = 60_000;

/** Cached SOL/USD (best-effort; multiple free sources). */
export async function fetchSolUsd(): Promise<number | null> {
  const now = Date.now();
  if (priceCache && now - priceCache.at < PRICE_TTL_MS) {
    return priceCache.usd;
  }

  const tryCoinbase = async (): Promise<number | null> => {
    try {
      const res = await fetch(
        "https://api.coinbase.com/v2/prices/SOL-USD/spot",
        {
          headers: { accept: "application/json" },
          signal: AbortSignal.timeout(8_000),
        },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as {
        data?: { amount?: string };
      };
      const n = Number(data.data?.amount);
      return Number.isFinite(n) && n > 0 ? n : null;
    } catch {
      return null;
    }
  };

  const tryCoingecko = async (): Promise<number | null> => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
        {
          headers: { accept: "application/json" },
          signal: AbortSignal.timeout(8_000),
        },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { solana?: { usd?: number } };
      const usd = data.solana?.usd;
      return typeof usd === "number" && Number.isFinite(usd) ? usd : null;
    } catch {
      return null;
    }
  };

  const usd = (await tryCoinbase()) ?? (await tryCoingecko());
  if (usd != null) {
    priceCache = { usd, at: now };
    return usd;
  }
  return priceCache?.usd ?? null;
}

function solDeltaForAddress(
  tx: ParsedTransactionWithMeta,
  address: string,
): number | null {
  try {
    const keys = tx.transaction.message.accountKeys;
    const idx = keys.findIndex((k) => k.pubkey.toBase58() === address);
    if (idx < 0 || !tx.meta) return null;
    const pre = tx.meta.preBalances[idx];
    const post = tx.meta.postBalances[idx];
    if (pre === undefined || post === undefined) return null;
    return (post - pre) / LAMPORTS_PER_SOL;
  } catch {
    return null;
  }
}

function memoFromTx(tx: ParsedTransactionWithMeta): string | null {
  try {
    for (const ix of tx.transaction.message.instructions) {
      if ("parsed" in ix && ix.program === "spl-memo") {
        const p = ix.parsed;
        if (typeof p === "string") return p;
        if (p && typeof p === "object" && "type" in p === false) {
          return String(p);
        }
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function lookupWallet(params: {
  address: string;
  network: NetworkMode;
  limit?: number;
}): Promise<WalletLookupResult> {
  const address = params.address.trim();
  if (!isLookupAddress(address)) {
    throw new Error("Invalid Solana address");
  }
  const network = params.network;
  const limit = Math.min(Math.max(params.limit ?? 12, 1), 25);
  const pubkey = new PublicKey(address);
  const connection = new Connection(rpcUrl(network), "confirmed");

  const [lamports, sigInfos, solUsd] = await Promise.all([
    connection.getBalance(pubkey),
    connection.getSignaturesForAddress(pubkey, { limit }),
    fetchSolUsd(),
  ]);

  const signatures = sigInfos.map((s) => s.signature);
  let parsed: (ParsedTransactionWithMeta | null)[] = [];
  if (signatures.length > 0) {
    try {
      parsed = await connection.getParsedTransactions(signatures, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });
    } catch {
      parsed = signatures.map(() => null);
    }
  }

  const transactions: WalletTxRow[] = sigInfos.map((info, i) => {
    const tx = parsed[i] ?? null;
    return {
      signature: info.signature,
      slot: info.slot,
      blockTime: info.blockTime ?? tx?.blockTime ?? null,
      err: info.err,
      memo: tx ? memoFromTx(tx) : null,
      solDelta: tx ? solDeltaForAddress(tx, address) : null,
      status: info.err ? "failed" : "success",
      explorerUrl: explorerTxUrl(info.signature, network),
    };
  });

  const balanceSol = lamports / LAMPORTS_PER_SOL;
  return {
    address,
    network,
    balanceSol,
    balanceLamports: lamports,
    solUsd,
    valueUsd:
      solUsd != null ? Math.round(balanceSol * solUsd * 100) / 100 : null,
    priceSource: solUsd != null ? "spot" : null,
    transactionCountHint: sigInfos.length,
    transactions,
    fetchedAt: new Date().toISOString(),
  };
}

export type { ConfirmedSignatureInfo };
