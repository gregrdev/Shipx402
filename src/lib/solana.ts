import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  type Cluster,
} from "@solana/web3.js";
import bs58 from "bs58";

export type NetworkMode = "devnet" | "mainnet-beta";

export const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

/** Prefer a dedicated RPC (Helius/QuickNode/etc.) for mainnet reliability. */
export function getRpcUrl(network: NetworkMode) {
  if (typeof import.meta !== "undefined") {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
      .env;
    const fromVite = env?.VITE_SOLANA_RPC_URL?.trim();
    if (fromVite && network === "mainnet-beta") return fromVite;
    if (fromVite && network === "devnet" && /devnet/i.test(fromVite)) return fromVite;
  }
  const cluster: Cluster = network === "devnet" ? "devnet" : "mainnet-beta";
  return clusterApiUrl(cluster);
}

export function getConnection(network: NetworkMode) {
  return new Connection(getRpcUrl(network), "confirmed");
}

export function explorerTxUrl(signature: string, network: NetworkMode) {
  const cluster = network === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

export function generateWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(keypair.secretKey),
    keypair,
  };
}

export function keypairFromSecret(secretKeyBase58: string) {
  const cleaned = secretKeyBase58.trim();
  const bytes = bs58.decode(cleaned);
  if (bytes.length !== 64) {
    throw new Error("Private key must decode to 64 bytes (Solana secret key)");
  }
  return Keypair.fromSecretKey(bytes);
}

export function walletFromSecret(secretKeyBase58: string) {
  const keypair = keypairFromSecret(secretKeyBase58);
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(keypair.secretKey),
    keypair,
  };
}

export function isValidSecretKey(secretKeyBase58: string) {
  try {
    walletFromSecret(secretKeyBase58);
    return true;
  } catch {
    return false;
  }
}

export async function getBalanceSol(publicKey: string, network: NetworkMode) {
  const connection = getConnection(network);
  const lamports = await connection.getBalance(new PublicKey(publicKey));
  return lamports / LAMPORTS_PER_SOL;
}

export async function requestDevnetAirdrop(publicKey: string, amountSol = 1) {
  const connection = getConnection("devnet");
  const sig = await connection.requestAirdrop(
    new PublicKey(publicKey),
    amountSol * LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}

export class TransferError extends Error {
  signature?: string;
  constructor(message: string, signature?: string) {
    super(message);
    this.name = "TransferError";
    this.signature = signature;
  }
}

export async function transferSol(params: {
  secretKeyBase58: string;
  toAddress: string;
  amountSol: number;
  network: NetworkMode;
}) {
  const { secretKeyBase58, toAddress, amountSol, network } = params;
  const from = keypairFromSecret(secretKeyBase58);
  const connection = getConnection(network);
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports,
    }),
  );

  // sendRaw path so we can surface the signature even if confirmation times out
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = from.publicKey;
  tx.sign(from);
  const raw = tx.serialize();

  let signature: string | undefined;
  try {
    signature = await connection.sendRawTransaction(raw, {
      skipPreflight: false,
    });
    await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed",
    );
    return signature;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Transfer failed";
    // Prefer signature extracted from error if send succeeded partially
    if (!signature && typeof err === "object" && err && "signature" in err) {
      signature = String((err as { signature: string }).signature);
    }
    throw new TransferError(
      signature
        ? `${msg} — check the explorer before retrying; the transfer may already be on-chain.`
        : msg,
      signature,
    );
  }
}

export function isValidSolanaAddress(address: string) {
  try {
    const key = new PublicKey(address);
    return PublicKey.isOnCurve(key.toBytes());
  } catch {
    return false;
  }
}
