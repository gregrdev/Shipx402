/**
 * Donation configuration for Ship x402.
 *
 * The donation address is PUBLIC (like an email). Never put a private key here.
 * QR codes are generated at runtime from this address (see DonationQr) so they
 * cannot drift from payTo.
 */

export const DONATION_ADDRESS =
  "3TSEZcCFm9fNtQ2aVvRAp5kJEPrtQyYVPCxJGCpVSB4G";

/** Donations always settle on mainnet — devnet SOL has no value. */
export const DONATION_NETWORK = "mainnet-beta" as const;

/** Minimum SOL for an x402 agent donation to be credited with a receipt. */
export const DONATION_MIN_SOL = 0.001;
export const DONATION_MIN_LAMPORTS = 1_000_000;

/** How old (in seconds) an on-chain donation tx may be and still count. */
export const DONATION_MAX_AGE_SECONDS = 45 * 60;

/**
 * Human tip tiers (SOL). Suggested range caps at 0.25.
 * Amounts above DONATION_GENEROUS_THRESHOLD_SOL get special thank-you recognition.
 * Tips are always optional — receipt min stays DONATION_MIN_SOL.
 */
export type DonationTier = {
  sol: number;
  label: string;
  blurb: string;
  /** Soft default / “goes a long way” highlight */
  recommended?: boolean;
  /** Playful accent only — no dark pattern */
  vibe?: "spark" | "heart" | "rocket";
};

export const DONATION_TIERS: readonly DonationTier[] = [
  {
    sol: 0.01,
    label: "Signal boost",
    blurb: "Tiny tip. Still means a lot.",
    vibe: "spark",
  },
  {
    sol: 0.05,
    label: "Coffee for the builder",
    blurb: "Keeps the guides free a little longer.",
    recommended: true,
    vibe: "heart",
  },
  {
    sol: 0.25,
    label: "Keep the lights on",
    blurb: "Top of the suggested range.",
    vibe: "rocket",
  },
] as const;

/** Flat preset amounts (compat with older call sites). */
export const DONATION_PRESETS_SOL = DONATION_TIERS.map((t) => t.sol);

/**
 * Suggested tip amounts for agents / machine-readable surfaces.
 * Caps at 0.25 — anything above is treated as generous recognition.
 */
export const DONATION_TIP_SUGGESTED_SOL = [0.01, 0.05, 0.25] as const;

/** Alias used by older agent surfaces. */
export const DONATION_AGENT_SUGGESTED_SOL = DONATION_TIP_SUGGESTED_SOL;

/** Neutral default agents/operators can use if their policy wants one amount. */
export const DONATION_CUSTOMARY_TIP_SOL = 0.05;

/**
 * Amounts strictly above this unlock the "huge thank you" recognition on the
 * receipt. Not a product tier — same free site either way.
 */
export const DONATION_GENEROUS_THRESHOLD_SOL = 0.25;

/** Default Solana Pay prefill = recommended / customary tier. */
export const DONATION_DEFAULT_SOL =
  DONATION_TIERS.find((t) => t.recommended)?.sol ?? DONATION_CUSTOMARY_TIP_SOL;

export const DONATION_RESOURCE_PATH = "/api/x402/donate";

/** Structural + on-curve check via length/charset; full check in DonationQr. */
export function isDonationAddressConfigured(address = DONATION_ADDRESS) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/** True when on-chain amount is above the suggested max preset. */
export function isGenerousDonation(amountSol: number): boolean {
  return Number.isFinite(amountSol) && amountSol > DONATION_GENEROUS_THRESHOLD_SOL;
}

export function donationThankYouCopy(amountSol: number): {
  title: string;
  message: string;
  recognition: "standard" | "generous";
} {
  if (isGenerousDonation(amountSol)) {
    return {
      title: "Huge thank you — that means a lot",
      message:
        "Your on-chain donation was verified, and it went well past the suggested range. That kind of support keeps Ship x402 free and independent. Real x402, real value — genuinely appreciated.",
      recognition: "generous",
    };
  }
  return {
    title: "Thank you for supporting Ship x402",
    message:
      "Your on-chain donation was verified. Real x402, real value — you just did in production what the lab taught.",
    recognition: "standard",
  };
}
