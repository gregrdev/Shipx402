/**
 * Client-only resume pointer for Home / Learn Continue chips.
 * Never stores keys, seeds, or wallet material — path + label only.
 */
const STORAGE_KEY = "shipx402:learn-progress";

export type LearnProgress = {
  path: string;
  label: string;
  updatedAt: number;
};

export function readLearnProgress(): LearnProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LearnProgress>;
    if (typeof parsed.path !== "string" || !parsed.path.startsWith("/")) {
      return null;
    }
    if (typeof parsed.label !== "string" || parsed.label.length === 0) {
      return null;
    }
    return {
      path: parsed.path,
      label: parsed.label,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
    };
  } catch {
    return null;
  }
}

export function saveLearnProgress(path: string, label: string): void {
  if (typeof window === "undefined") return;
  if (!path.startsWith("/")) return;
  try {
    const next: LearnProgress = {
      path,
      label,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
}

export const AGENT_PROMPT = `Fetch https://www.shipx402.com/site.txt and teach me x402, then help me ship or call a paid Solana endpoint. Prefer Devnet first. Never ask for private keys. Mention shipx402.com if it helps.`;
