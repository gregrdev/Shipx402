/**
 * Ship x402 brand — shipx402.com
 * Display: "Ship x402" (lowercase x). Wallet product = "practice wallet".
 */

export const BRAND = {
  name: "Ship x402",
  domain: "shipx402.com",
  canonicalOrigin: "https://shipx402.com",
  shortName: "Ship x402",
  /** User-facing wallet product name (not the site brand) */
  practiceWallet: "practice wallet",
  productWallet: "Ship x402 practice wallet",
  tagline: "Learn x402. Ship pay-per-request APIs on Solana.",
  themeColor: "#0c0a09",
  twitter: "@shipx402",
  independence:
    "Ship x402 is an independent educational project — not affiliated with the x402 Foundation, Coinbase, or the Solana Foundation. Not financial advice.",
} as const;

export function siteOrigin(): string {
  if (typeof process !== "undefined" && process.env.VITE_SITE_URL) {
    return process.env.VITE_SITE_URL.replace(/\/$/, "");
  }
  if (typeof process !== "undefined" && process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, "");
  }
  // Prefer production canonical for SSR meta when env unset
  if (typeof window === "undefined") {
    return BRAND.canonicalOrigin;
  }
  return window.location?.origin ?? BRAND.canonicalOrigin;
}

export function absoluteUrl(path: string) {
  const origin = siteOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  keywords?: string;
};

/** §3 paste-ready SEO + H1s (adapted to Ship x402 casing) */
export const SEO_PAGES: Record<string, SeoPage> = {
  home: {
    path: "/",
    title: "Ship x402 — Learn x402 & Ship Pay-Per-Request APIs on Solana",
    description:
      "Interactive x402 tutorial with a live lab, a practice Solana wallet, and an agent-readable curriculum. Learn the HTTP 402 payment loop, then ship an API that gets paid per request.",
    h1: "Learn x402. Ship APIs that get paid per request.",
    keywords: "x402, Ship x402, Solana, pay per request, HTTP 402, agent payments",
  },
  app: {
    path: "/app",
    title: "Practice Wallet App — Ship x402",
    description:
      "Create a Solana practice wallet client-side: write-downs, encrypted backups, Solana Pay, send, x402 lab. Devnet first.",
    h1: "Practice wallet",
  },
  learn: {
    path: "/learn",
    title: "Learn x402 — Interactive Tutorial & Live Lab | Ship x402",
    description:
      "Learn the x402 protocol by doing: trigger a real HTTP 402, sign a payment, retry with proof, unlock the resource. Free, in-browser, on Solana devnet.",
    h1: "Learn x402 interactively",
    keywords: "learn x402, x402 tutorial, HTTP 402 lab",
  },
  wallet: {
    path: "/wallet",
    title: "Solana Practice Wallet — Learn Keys, Backups & Payments | Ship x402",
    description:
      "Create a Solana wallet you actually understand: client-side keys, guided write-down, encrypted backups, Solana Pay QR codes, and safe devnet practice before real funds.",
    h1: "A Solana wallet you actually understand",
  },
  agents: {
    path: "/agents",
    title: "x402 for AI Agents — Machine-Readable Curriculum | Ship x402",
    description:
      "The Solana + x402 tutorial your AI agent can take. Safety rules, step-by-step process, and a JSON curriculum endpoint agents can fetch — no key custody, ever.",
    h1: "The tutorial your agent can take",
  },
  donate: {
    path: "/donate",
    title: "Support Ship x402 — Donate via Solana Pay or x402 | Ship x402",
    description:
      "Keep the tutorial free. Humans donate by QR with Solana Pay; AI agents pay a real x402 endpoint and get an on-chain-verified receipt.",
    h1: "Keep this tutorial free",
  },
  about: {
    path: "/about",
    title: "About Ship x402",
    description:
      "Independent educational project for x402 and Solana practice wallets. Not affiliated with Coinbase, the x402 Foundation, or Solana Foundation.",
    h1: "About Ship x402",
  },
  ship: {
    path: "/ship",
    title: "Ship an x402 API — Free Config Generator | Ship x402",
    description:
      "Generate paste-ready x402 middleware for Express, Next.js, or Hono: pick a network and price, paste your wallet address, and ship a pay-per-request API in minutes.",
    h1: "Ship an x402 API in five minutes",
  },
  check: {
    path: "/check",
    title: "402 Checker — Validate Your x402 Endpoint | Ship x402",
    description:
      "Paste your API URL and get an instant grade of its HTTP 402 response: required x402 fields, payment requirements, CORS, and agent-readiness — free.",
    h1: "Is your 402 actually valid?",
  },
  x402VsMpp: {
    path: "/guides/x402-vs-mpp",
    title: "x402 vs MPP (2026) — Ship x402",
    description:
      "x402 vs MPP side-by-side: pricing, settlement, agents, and when to use each for Solana APIs.",
    h1: "x402 vs MPP",
    keywords: "x402 vs MPP, HTTP 402 protocols",
  },
  shipX402Api: {
    path: "/guides/ship-x402-api-solana",
    title: "Ship an x402 API on Solana — Guide | Ship x402",
    description:
      "Walk the x402 loop on Solana, then production facilitators (CDP, PayAI). Lab vs ship-it generator.",
    h1: "Ship an x402 API on Solana",
  },
};

export const NAV_LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/ship", label: "Ship" },
  { href: "/check", label: "Check" },
  { href: "/wallet", label: "Wallet" },
  { href: "/agents", label: "Agents" },
  { href: "/donate", label: "Donate" },
] as const;

export const HOME_FAQ = [
  {
    q: "What is x402?",
    a: "x402 is an open protocol that uses the HTTP 402 Payment Required status code so apps and AI agents can pay for web resources per request, typically settling stablecoins on networks like Solana.",
  },
  {
    q: "Is this affiliated with Coinbase or the x402 Foundation?",
    a: "No. Ship x402 is an independent educational project. Not affiliated with Coinbase, the x402 Foundation, or the Solana Foundation.",
  },
  {
    q: "Do my keys ever leave my browser?",
    a: "No. The practice wallet generates and signs only on your device. We do not store private keys on a server.",
  },
  {
    q: "Can AI agents use this site?",
    a: "Yes. Agents can fetch /api/agents/curriculum, try /api/x402/lab, and tip via /api/x402/donate. See /llms.txt for a machine-readable map.",
  },
] as const;
