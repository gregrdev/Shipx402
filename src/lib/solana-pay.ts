import QRCode from "qrcode";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { USDC_MINT_DEVNET, USDC_MINT_MAINNET, type NetworkMode } from "./solana";

export type PaymentToken = "SOL" | "USDC";

export type PaymentRequestFields = {
  recipient: string;
  amount?: number;
  token: PaymentToken;
  label?: string;
  message?: string;
  memo?: string;
  reference?: string;
  network: NetworkMode;
};

export function createReference() {
  return Keypair.generate().publicKey.toBase58();
}

export function encodeSolanaPayUrl(fields: PaymentRequestFields) {
  const params = new URLSearchParams();

  if (fields.amount !== undefined && fields.amount > 0) {
    params.set("amount", String(fields.amount));
  }

  if (fields.token === "USDC") {
    const mint =
      fields.network === "devnet" ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
    params.set("spl-token", mint);
  }

  if (fields.reference) params.set("reference", fields.reference);
  if (fields.label) params.set("label", fields.label);
  if (fields.message) params.set("message", fields.message);
  if (fields.memo) params.set("memo", fields.memo);

  const query = params.toString();
  return query
    ? `solana:${fields.recipient}?${query}`
    : `solana:${fields.recipient}`;
}

export async function createPaymentQrDataUrl(
  url: string,
  options?: { size?: number; dark?: string; light?: string },
) {
  const size = options?.size ?? 280;
  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: {
      dark: options?.dark ?? "#0a0b0d",
      light: options?.light ?? "#f0f2f5",
    },
    errorCorrectionLevel: "M",
  });
}

export function encodeSecretKeyArray(secretKeyBase58: string) {
  return Array.from(bs58.decode(secretKeyBase58));
}
