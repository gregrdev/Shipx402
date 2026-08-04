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

/** Preset human amounts (SOL). */
export const DONATION_PRESETS_SOL = [0.01, 0.05, 0.25] as const;

export const DONATION_RESOURCE_PATH = "/api/x402/donate";

/** Structural + on-curve check via length/charset; full check in DonationQr. */
export function isDonationAddressConfigured(address = DONATION_ADDRESS) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}
