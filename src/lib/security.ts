/**
 * Client-side security helpers for EZSolWallet.
 *
 * Honest model: a browser wallet can never match a hardware wallet.
 * We minimize risk: no secret persistence, short sessions, clear UX, strong backup encryption.
 */

/** Idle lock timeout while a wallet is unlocked (ms). */
export const IDLE_LOCK_MS = 15 * 60 * 1000;

/** Clear private key from clipboard after this delay (ms). */
export const CLIPBOARD_CLEAR_MS = 45_000;

export const SECURITY_FACTS = [
  {
    title: "Keys never leave your device",
    body: "Generation, signing, and encryption run in your browser. EZSolWallet does not have an account database of private keys.",
  },
  {
    title: "Nothing secret is stored on our servers",
    body: "The unlocked key lives only in this tab’s memory. Closing or locking clears it. localStorage only keeps network preference, never your private key.",
  },
  {
    title: "Cross-device = you move the secret",
    body: "To use another phone or computer you import the private key or an encrypted backup file you control. We never sync keys in the cloud for you.",
  },
  {
    title: "Encrypted backups use strong crypto",
    body: "PBKDF2-SHA-256 (600k iterations on new files) derives a key from your password; AES-256-GCM encrypts the private key. Prefer a 4+ word passphrase.",
  },
  {
    title: "Sessions auto-lock",
    body: "After idle time, or when you leave the tab for a while, the wallet locks so a shared computer is less exposed.",
  },
  {
    title: "Browser wallets have limits",
    body: "Malware, fake extensions, or phishing sites can still steal keys you paste. Prefer password managers, never chat apps. Large mainnet funds belong in a hardware wallet.",
  },
] as const;

export async function copySensitiveText(text: string) {
  await navigator.clipboard.writeText(text);
  // Best-effort clear later — clipboard *history* managers may still retain a copy.
  window.setTimeout(() => {
    void navigator.clipboard
      .readText()
      .then((current) => {
        if (current === text) {
          void navigator.clipboard.writeText("").catch(() => {});
        }
      })
      .catch(() => {
        // Some browsers block read; ignore.
      });
  }, CLIPBOARD_CLEAR_MS);
}

export function isSecureContextOk() {
  if (typeof window === "undefined") return true;
  return window.isSecureContext;
}
