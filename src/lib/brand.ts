/**
 * Ship x402 brand  |  shipx402.com
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
    "Ship x402 is an independent educational project, not affiliated with the x402 Foundation, Coinbase, or the Solana Foundation. Not financial advice.",
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
    title: "Ship x402 | Learn x402 and Ship Pay-Per-Request APIs on Solana",
    description:
      "x402 lets an API charge a small payment before it returns data. Learn the loop, practice a Solana wallet on Devnet, then ship and validate real 402s.",
    h1: "Learn x402. Ship APIs that get paid per request.",
    keywords: "x402, Ship x402, Solana, pay per request, HTTP 402, agent payments",
  },
  app: {
    path: "/app",
    title: "Practice Wallet App  |  Ship x402",
    description:
      "Create a Solana practice wallet client-side: write-downs, encrypted backups, Solana Pay, send, x402 lab. Devnet first.",
    h1: "Practice wallet",
  },
  learn: {
    path: "/learn",
    title: "Learn x402 | Interactive Tutorial and Live Lab | Ship x402",
    description:
      "Learn the x402 payment loop in plain English: request, 402, pay, retry, unlock. Free, in-browser, on Solana devnet.",
    h1: "Learn the x402 payment loop",
    keywords: "learn x402, x402 tutorial, HTTP 402 lab",
  },
  wallet: {
    path: "/wallet",
    title: "Solana Practice Wallet  |  Learn Keys, Backups & Payments | Ship x402",
    description:
      "Create a Solana wallet you actually understand: client-side keys, guided write-down, encrypted backups, Solana Pay QR codes, and safe devnet practice before real funds.",
    h1: "A Solana wallet you actually understand",
  },
  agents: {
    path: "/agents",
    title: "x402 for AI Agents  |  Machine-Readable Curriculum | Ship x402",
    description:
      "The Solana + x402 tutorial your AI agent can take. Safety rules, step-by-step process, and a JSON curriculum endpoint agents can fetch  |  no key custody, ever.",
    h1: "The tutorial your agent can take",
  },
  donate: {
    path: "/donate",
    title: "Support Ship x402  |  Donate via Solana Pay or x402 | Ship x402",
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
    title: "Ship an x402 API  |  Free Config Generator | Ship x402",
    description:
      "Generate paste-ready x402 middleware for Express, Next.js, or Hono: pick a network and price, paste your wallet address, and ship a pay-per-request API in minutes.",
    h1: "Ship an x402 API in five minutes",
  },
  check: {
    path: "/check",
    title: "402 Checker | Validate Your x402 Endpoint | Ship x402",
    description:
      "Paste your API URL and get an instant grade of its HTTP 402 response: required fields, payment requirements, and agent readiness. Free, no account.",
    h1: "Is your 402 actually valid?",
  },
  x402VsMpp: {
    path: "/guides/x402-vs-mpp",
    title: "x402 vs Stripe MPP (2026) | Ship x402",
    description:
      "x402 vs Stripe MPP side-by-side: rails, sessions, fees, and when to use each for APIs and agents in 2026.",
    h1: "x402 vs Stripe MPP",
    keywords: "x402 vs MPP, Stripe MPP, HTTP 402, agent payments",
  },
  shipX402Api: {
    path: "/guides/ship-x402-api-solana",
    title: "Ship an x402 API on Solana | Guide | Ship x402",
    description:
      "Step-by-step: protect a Solana route with x402 v2 middleware, test the 402, then switch to mainnet facilitators (CDP, PayAI).",
    h1: "Ship an x402 API on Solana",
  },
  whatIsX402: {
    path: "/guides/what-is-x402",
    title: "What is x402? A plain-English guide | Ship x402",
    description:
      "x402 lets an API charge a small payment before it returns data. A plain-English guide for people who are not crypto experts.",
    h1: "What is x402?",
    keywords: "what is x402, HTTP 402 Payment Required, agent payments explained",
  },
  firstSolanaWallet: {
    path: "/guides/first-solana-wallet",
    title: "Your First Solana Wallet (Devnet, No Risk) | Ship x402",
    description:
      "Make your first Solana wallet the safe way: practice on Devnet with fake money, learn public keys vs private keys, and back it up right. No real funds needed.",
    h1: "Your first Solana wallet (Devnet, no risk)",
    keywords:
      "how to make a Solana wallet, Solana devnet wallet, Phantom devnet, practice Solana wallet",
  },
  agentsSpendMoney: {
    path: "/guides/can-ai-agents-spend-money",
    title: "Can AI Agents Actually Spend Money Now? | Ship x402",
    description:
      "Yes, with guardrails. How AI agents pay for APIs and services per request using x402, what that really means, and the limits you set yourself.",
    h1: "Can AI agents actually spend money now?",
    keywords:
      "can AI agents spend money, agent payments, autonomous agent payments, x402 agents",
  },
  testX402Endpoint: {
    path: "/guides/test-x402-endpoint",
    title: "How to Test an x402 Endpoint (Read the 402 Response) | Ship x402",
    description:
      "If your paid API is broken, the 402 response usually tells you why. How to test an x402 endpoint, read the response, and fix common setup mistakes.",
    h1: "How to test an x402 endpoint",
    keywords:
      "test x402 endpoint, read 402 response, debug x402, 402 checker",
  },
  facilitatorsExplained: {
    path: "/guides/facilitators-explained",
    title: "x402 Facilitators Explained: CDP vs PayAI vs Your Own | Ship x402",
    description:
      "A facilitator helps verify and settle x402 payments so every API does not run full blockchain ops itself. Coinbase CDP, PayAI, and self-hosting compared.",
    h1: "Facilitators, explained simply",
    keywords:
      "x402 facilitator, Coinbase CDP facilitator, PayAI facilitator, self-hosted x402 facilitator",
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
