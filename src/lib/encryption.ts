/**
 * Password-based encryption for wallet backups.
 * PBKDF2 (SHA-256) + AES-256-GCM via Web Crypto.
 * New backups use 600_000 iterations; decrypt reads iterations from the file.
 */

const PBKDF2_ITERATIONS_NEW = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function toBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromBase64(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const saltBuf = new Uint8Array(salt);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuf,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export type EncryptedBackup = {
  v: 1;
  alg: "PBKDF2-AES-256-GCM";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  publicKey: string;
  createdAt: string;
};

export async function encryptSecretKey(params: {
  secretKeyBase58: string;
  publicKey: string;
  password: string;
}): Promise<EncryptedBackup> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(params.password, salt, PBKDF2_ITERATIONS_NEW);
  const plaintext = new TextEncoder().encode(params.secretKeyBase58);

  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext,
  );

  return {
    v: 1,
    alg: "PBKDF2-AES-256-GCM",
    iterations: PBKDF2_ITERATIONS_NEW,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(cipherBuf)),
    publicKey: params.publicKey,
    createdAt: new Date().toISOString(),
  };
}

export async function decryptSecretKey(
  backup: EncryptedBackup,
  password: string,
): Promise<string> {
  const salt = fromBase64(backup.salt);
  const iv = fromBase64(backup.iv);
  const ciphertext = fromBase64(backup.ciphertext);
  const iterations =
    typeof backup.iterations === "number" && backup.iterations > 0
      ? backup.iterations
      : 310_000; // legacy default
  const key = await deriveKey(password, salt, iterations);

  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    new Uint8Array(ciphertext),
  );

  return new TextDecoder().decode(plainBuf);
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Rough passphrase guidance (not a full zxcvbn meter). */
export function passwordStrengthHint(password: string): {
  ok: boolean;
  label: string;
} {
  if (password.length < 8) return { ok: false, label: "Too short (min 8)" };
  const words = password.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 4 && password.length >= 16) {
    return { ok: true, label: "Strong passphrase" };
  }
  if (password.length >= 14 && /[A-Za-z]/.test(password) && /\d/.test(password)) {
    return { ok: true, label: "Good" };
  }
  if (password.length >= 10) return { ok: true, label: "OK — prefer 4+ random words" };
  return { ok: false, label: "Weak — use a longer passphrase" };
}
