/**
 * Canonical beginner → advanced map for Ship x402.
 * Used by /learn hub, footer, and curriculum-adjacent UI.
 */

export type GuideLevel = "beginner" | "intermediate" | "advanced";

export type LearningItem = {
  level: GuideLevel;
  title: string;
  path: string;
  blurb: string;
  /** external path starts with http or is /api */
  external?: boolean;
};

export const LEARNING_PATH: LearningItem[] = [
  // Beginner
  {
    level: "beginner",
    title: "What is x402?",
    path: "/guides/what-is-x402",
    blurb: "Plain-English idea: pay-per-request over HTTP 402.",
  },
  {
    level: "beginner",
    title: "Your first Solana wallet",
    path: "/guides/first-solana-wallet",
    blurb: "Public vs private keys on Devnet — zero real risk.",
  },
  {
    level: "beginner",
    title: "What is an RPC?",
    path: "/guides/what-is-an-rpc",
    blurb: "Blockchain reader vs the paywall. Why endpoints need one.",
  },
  {
    level: "beginner",
    title: "Reading a Solana transaction",
    path: "/guides/reading-solana-tx",
    blurb: "Open a transfer on Solscan and understand the fields.",
  },
  {
    level: "beginner",
    title: "The payment loop (interactive)",
    path: "/loop",
    blurb: "Live 402 → read tag → dry-run → quiz → free certificate.",
  },
  // Intermediate
  {
    level: "intermediate",
    title: "Facilitators explained",
    path: "/guides/facilitators-explained",
    blurb: "CDP, PayAI, test facilitator, self-host — when to pick which.",
  },
  {
    level: "intermediate",
    title: "Test an x402 endpoint",
    path: "/guides/test-x402-endpoint",
    blurb: "Read the 402 body and fix common setup mistakes.",
  },
  {
    level: "intermediate",
    title: "Ship an x402 API on Solana",
    path: "/guides/ship-x402-api-solana",
    blurb: "v2 middleware, CAIP-2 networks, go-live checklist.",
  },
  {
    level: "intermediate",
    title: "x402 v1 vs v2",
    path: "/guides/x402-v1-vs-v2",
    blurb: "Headers, CAIP-2, resource envelope — avoid breaking testers.",
  },
  {
    level: "intermediate",
    title: "x402 vs Stripe MPP",
    path: "/guides/x402-vs-mpp",
    blurb: "When open micropayments win vs session/fiat rails.",
  },
  {
    level: "intermediate",
    title: "The blind-transfer problem",
    path: "/guides/blind-transfer-problem",
    blurb: "When someone wants to pay but you have no 402.",
  },
  // Advanced
  {
    level: "advanced",
    title: "Can AI agents spend money?",
    path: "/guides/can-ai-agents-spend-money",
    blurb: "Yes — inside spend limits and allowlists you set.",
  },
  {
    level: "advanced",
    title: "x402 vs token-gating",
    path: "/guides/x402-vs-token-gating",
    blurb: "Server-side 402 paywall vs on-chain token checks.",
  },
  {
    level: "advanced",
    title: "Give an agent a wallet safely",
    path: "/guides/agent-wallet-safely",
    blurb: "Caps, allowlists, dry-run, never the main key.",
  },
  {
    level: "advanced",
    title: "Why agent-readable matters",
    path: "/guides/agent-readable",
    blurb: "llms.txt, curriculum JSON, well-known agent cards.",
  },
  {
    level: "advanced",
    title: "HTTP 402: 30 years dormant",
    path: "/guides/http-402-history",
    blurb: "Story of the status code that became agent payments.",
  },
];

export const LEVEL_META: Record<
  GuideLevel,
  { label: string; description: string }
> = {
  beginner: {
    label: "Beginner",
    description: "Concepts, wallets, and the payment loop — no code required.",
  },
  intermediate: {
    label: "Intermediate",
    description: "Build, test, migrate, and choose the right rails.",
  },
  advanced: {
    label: "Advanced / agents",
    description: "Agent wallets, paywall design, and machine-readable surfaces.",
  },
};
