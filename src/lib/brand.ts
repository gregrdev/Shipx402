/**
 * Ship x402 brand  |  shipx402.com
 * Display: "Ship x402" (lowercase x). Wallet product = "practice wallet".
 *
 * Phrase system (do not collapse to one slogan):
 * - Site H1 / SEO: outcome-first (ship paid API / agent payments)
 * - Dual-audience section: "You and your agent learn x402 together"
 * - Agents page + machine index: "Where agents learn x402"
 * - FAQ / query cards: exact questions people type
 */

export const BRAND = {
  name: "Ship x402",
  /** Display / brand host (apex). Canonical URLs use www — see canonicalOrigin. */
  domain: "shipx402.com",
  /** Preferred public origin. Apex 308s here; canonical tags + digests use this. */
  canonicalOrigin: "https://www.shipx402.com",
  shortName: "Ship x402",
  /** User-facing wallet product name (not the site brand) */
  practiceWallet: "practice wallet",
  productWallet: "Ship x402 practice wallet",
  tagline: "Your agent can ship a paid Solana API.",
  /** Shared closer — one string, never glue a leftover “from one prompt.” */
  closer:
    "Your agent can ship a paid Solana API. Practice on Devnet. Ship when you understand the loop.",
  /** Dual-audience line — homepage section H2, social, word-of-mouth */
  dualAudience: "You and your agent learn x402 together",
  /** Agent-search line — /agents H1, machine surfaces */
  agentsLearn: "Where agents learn x402 on Solana",
  themeColor: "#12151b",
  twitter: "@shipx402",
  independence:
    "Ship x402 is an independent educational project, not affiliated with the x402 Foundation, Coinbase, or the Solana Foundation. Not financial advice.",
} as const;

/** Normalize a production host to the www canonical origin. Preview hosts stay as-is. */
function normalizePublicOrigin(origin: string): string {
  const trimmed = origin.replace(/\/$/, "");
  try {
    const u = new URL(trimmed);
    if (u.hostname === "shipx402.com" || u.hostname === "www.shipx402.com") {
      return BRAND.canonicalOrigin;
    }
  } catch {
    /* keep as given */
  }
  return trimmed;
}

export function siteOrigin(): string {
  if (typeof process !== "undefined" && process.env.VITE_SITE_URL) {
    return normalizePublicOrigin(process.env.VITE_SITE_URL);
  }
  if (typeof process !== "undefined" && process.env.SITE_URL) {
    return normalizePublicOrigin(process.env.SITE_URL);
  }
  if (typeof window === "undefined") {
    return BRAND.canonicalOrigin;
  }
  const loc = window.location?.origin;
  if (loc) return normalizePublicOrigin(loc);
  return BRAND.canonicalOrigin;
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

export const SEO_PAGES: Record<string, SeoPage> = {
  home: {
    path: "/",
    title: "Ship x402 | Your Agent Can Ship a Paid Solana API",
    description:
      "Paste site.txt into your agent and ship a paid Solana endpoint. Humans and AI agents learn the same x402 path — payment loop, 402 Checker, practice wallet, free curriculum.",
    h1: "Your agent can ship a paid Solana API",
    keywords:
      "x402, Ship x402, Solana, pay per request, HTTP 402, agent payments, AI agent pay for APIs, site.txt, learn x402",
  },
  app: {
    path: "/app",
    title: "Practice wallet | Ship x402",
    description:
      "Create a Solana practice wallet client-side: write-downs, encrypted backups, Solana Pay, send, x402 lab. Devnet first.",
    h1: "Practice wallet",
  },
  learn: {
    path: "/learn",
    title: "Learn x402 | Beginner to Advanced Path | Ship x402",
    description:
      "Structured learning path for x402: beginner concepts, intermediate build/test, advanced agent safety. Free, in-browser, Solana-first.",
    h1: "Learn x402 from Beginner to Advanced",
    keywords: "learn x402, x402 tutorial, HTTP 402 lab, agent payments course",
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
    title: "Where Agents Learn x402 on Solana | Ship x402",
    description:
      "Teach your AI agent to pay per request on Solana. site.txt, curriculum JSON, live 402 lab, wallet safety — no key custody. How to get your agent paying safely.",
    h1: "Where agents learn x402 on Solana",
    keywords:
      "where agents learn x402, AI agent pay Solana, agent wallet, agent payments, x402 curriculum, site.txt",
  },
  donate: {
    path: "/donate",
    title: "Support Ship x402  |  Tip What It's Worth | Ship x402",
    description:
      "If the guides or tools helped, tip what you think it's worth. Optional Solana Pay QR or agent x402 tip — keeps the site free.",
    h1: "Tip what you think it's worth",
  },
  loop: {
    path: "/loop",
    title: "x402 Payment Loop + Free Certificate | Ship x402",
    description:
      "Interactive walkthrough: see a live 402, read the price tag, dry-run the client loop, pass a knowledge check, and earn a free educational certificate. Tips optional.",
    h1: "Walk the x402 Payment Loop",
    keywords:
      "x402 payment loop, HTTP 402 tutorial, free certificate, agent payments walkthrough",
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
      "Paste your API URL and get an instant grade of its HTTP 402: PAYMENT-REQUIRED header, CAIP-2 network, scheme, and accepts[] fields. Free, no account.",
    h1: "Is your 402 actually valid?",
  },
  explorer: {
    path: "/explorer",
    title: "SOL Balance & Transaction Lookup | Ship x402",
    description:
      "Paste a public Solana address for live SOL balance and recent txs. Read-only RPC lookup — not an x402 protocol explorer.",
    h1: "Check a wallet’s SOL balance & transactions",
    keywords:
      "Solana balance checker, SOL wallet lookup, Solana transaction history, check wallet balance",
  },
  tools: {
    path: "/tools",
    title: "Tools & Site Directory | Ship x402",
    description:
      "Public tools, guides in learning order, and agent endpoints — in one place.",
    h1: "Everything on this site",
    keywords: "ship x402 tools, x402 directory, agent digest, site map",
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
    title: "What Is x402? A Plain-English Guide | Ship x402",
    description:
      "x402 lets an API charge a small payment before it returns data. A plain-English guide for people who are not crypto experts.",
    h1: "What Is x402?",
    keywords: "what is x402, HTTP 402 Payment Required, agent payments explained",
  },
  firstSolanaWallet: {
    path: "/guides/first-solana-wallet",
    title: "Your First Solana Wallet (Devnet, No Risk) | Ship x402",
    description:
      "Make your first Solana wallet the safe way: practice on Devnet with fake money, learn public keys vs private keys, and back it up right. No real funds needed.",
    h1: "Your First Solana Wallet (Devnet, No Risk)",
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
    h1: "How to Test an x402 Endpoint",
    keywords: "test x402 endpoint, read 402 response, debug x402, 402 checker",
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
  whatIsAnRpc: {
    path: "/guides/what-is-an-rpc",
    title: "What Is an RPC? Why Your x402 Endpoint Needs One | Ship x402",
    description:
      "RPC is the blockchain reader/writer — not the paywall and not the facilitator. Clear mental model for x402 builders.",
    h1: "What Is an RPC, and Why Your x402 Endpoint Needs One",
    keywords: "Solana RPC, Helius, x402 RPC, blockchain RPC explained",
  },
  x402V1VsV2: {
    path: "/guides/x402-v1-vs-v2",
    title: "x402 v1 vs v2: Migration Guide | Ship x402",
    description:
      "PAYMENT-REQUIRED / PAYMENT-SIGNATURE / PAYMENT-RESPONSE, CAIP-2 networks, top-level resource — what changed in x402 v2.",
    h1: "x402 v1 vs v2: What Changed (and How to Keep Testers Working)",
    keywords: "x402 v2, CAIP-2, PAYMENT-SIGNATURE, migrate x402",
  },
  blindTransfer: {
    path: "/guides/blind-transfer-problem",
    title: "The Blind Transfer Problem (No 402) | Ship x402",
    description:
      "When an agent wants to pay but you only published a wallet address. Why x402 exists and how to fix blind tips.",
    h1: "When an agent wants to pay you but you have no 402",
    keywords: "blind transfer, agent tip, x402 donation, payment required",
  },
  x402VsTokenGating: {
    path: "/guides/x402-vs-token-gating",
    title: "x402 vs Token-Gating for AI Agents | Ship x402",
    description:
      "Server-side HTTP 402 pay-per-request vs on-chain token membership checks — when to use each for agents.",
    h1: "Two ways to paywall for AI agents: x402 vs token-gating",
    keywords: "token gating vs x402, NFT gate, agent paywall",
  },
  agentWalletSafely: {
    path: "/guides/agent-wallet-safely",
    title: "Give an Agent a Wallet Safely | Ship x402",
    description:
      "Spend limits, allowlists, dry-runs, separate keys — how to fund an agent without risking the main vault.",
    h1: "Give an Agent a Wallet Safely",
    keywords: "agent wallet, spend limits, allowlist, AI payments safety",
  },
  readingSolanaTx: {
    path: "/guides/reading-solana-tx",
    title: "Reading a Solana Transaction on Solscan | Ship x402",
    description:
      "Beginner guide to transaction signatures, balance changes, and checking payment proofs on Solscan.",
    h1: "Reading a Solana Transaction on Solscan",
    keywords: "Solscan tutorial, Solana transaction, payment proof",
  },
  agentReadable: {
    path: "/guides/agent-readable",
    title: "Why Agent-Readable Sites Matter | Ship x402",
    description:
      "llms.txt, curriculum JSON, well-known agent cards, and live 402 endpoints — design for humans and machines.",
    h1: "Why Agent-Readable Matters",
    keywords: "llms.txt, agent-card.json, agent discovery, x402 curriculum",
  },
  http402History: {
    path: "/guides/http-402-history",
    title: "HTTP 402: 30 Years Dormant, Now Agent Payments | Ship x402",
    description:
      "The story of HTTP 402 Payment Required and how x402 turned it into an agent payment layer in 2025–2026.",
    h1: "HTTP 402: thirty years dormant, now the agent payment layer",
    keywords: "HTTP 402 history, Payment Required, x402 origin",
  },
};

export const NAV_LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/loop", label: "Loop" },
  { href: "/tools", label: "Tools" },
  { href: "/ship", label: "Ship" },
  { href: "/check", label: "Check" },
  { href: "/explorer", label: "Balance" },
  { href: "/agents", label: "Agents" },
  { href: "/donate", label: "Donate" },
] as const;

/** Query-shaped FAQ — H2/schema answers. Home shows this compact set. */
export const HOME_FAQ = [
  {
    q: "What Is x402?",
    a: "x402 is an open protocol that uses HTTP 402 Payment Required so apps and AI agents can pay for web resources per request — typically settling stablecoins on networks like Solana. V2 puts the challenge in PAYMENT-REQUIRED, the retry in PAYMENT-SIGNATURE, and settlement in PAYMENT-RESPONSE. No API keys or subscriptions: the wallet is the credential.",
  },
  {
    q: "Do my keys ever leave my browser?",
    a: "No. The practice wallet generates and signs only on your device. We do not store private keys on a server. Agents should never ask for private keys either.",
  },
  {
    q: "Is this affiliated with Coinbase or the x402 Foundation?",
    a: "No. Ship x402 is an independent educational project. Not affiliated with Coinbase, the x402 Foundation, or the Solana Foundation.",
  },
] as const;
