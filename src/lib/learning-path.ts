/**
 * Canonical beginner → advanced map for Ship x402.
 * Beginner: intro → first wallet → payment loop (before RPC/tx) →
 * V2 headers & CAIP-2 → facilitator → seller path → agent safety.
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
  // Beginner — intro → wallet → payment loop (before RPC/tx)
  {
    level: "beginner",
    title: "What Is x402?",
    path: "/guides/what-is-x402",
    blurb: "Plain-English idea: pay-per-request over HTTP 402.",
  },
  {
    level: "beginner",
    title: "Your First Solana Wallet",
    path: "/guides/first-solana-wallet",
    blurb: "Public vs private keys on Devnet (practice network · free test money).",
  },
  {
    level: "beginner",
    title: "The Payment Loop (Interactive)",
    path: "/loop",
    blurb: "Live 402 → PAYMENT-REQUIRED → pay → PAYMENT-SIGNATURE retry.",
  },
  {
    level: "beginner",
    title: "What Is an RPC?",
    path: "/guides/what-is-an-rpc",
    blurb: "Blockchain reader vs the paywall. Why endpoints need one.",
  },
  {
    level: "beginner",
    title: "Reading a Solana Transaction",
    path: "/guides/reading-solana-tx",
    blurb: "Open a transfer on Solscan and understand the fields.",
  },
  // Intermediate — V2 headers first, then facilitator, then ship
  {
    level: "intermediate",
    title: "x402 v1 vs v2",
    path: "/guides/x402-v1-vs-v2",
    blurb: "PAYMENT-* headers, CAIP-2 (standard network id — genesis-hash form), resource envelope — avoid breaking testers.",
  },
  {
    level: "intermediate",
    title: "Facilitators Explained",
    path: "/guides/facilitators-explained",
    blurb: "x402.org testnet, CDP, PayAI, self-host — when to pick which.",
  },
  {
    level: "intermediate",
    title: "Test an x402 Endpoint",
    path: "/guides/test-x402-endpoint",
    blurb: "Read PAYMENT-REQUIRED + the 402 body; fix common setup mistakes.",
  },
  {
    level: "intermediate",
    title: "Ship an x402 API on Solana",
    path: "/guides/ship-x402-api-solana",
    blurb: "v2 middleware, CAIP-2, exact scheme, USDC, go-live checklist.",
  },
  {
    level: "intermediate",
    title: "x402 vs Stripe MPP",
    path: "/guides/x402-vs-mpp",
    blurb: "When open micropayments win vs session/fiat rails.",
  },
  {
    level: "intermediate",
    title: "The Blind-Transfer Problem",
    path: "/guides/blind-transfer-problem",
    blurb: "When someone wants to pay but you have no 402.",
  },
  // Advanced
  {
    level: "advanced",
    title: "Can AI Agents Spend Money?",
    path: "/guides/can-ai-agents-spend-money",
    blurb: "Yes — inside spend limits and allowlists you set.",
  },
  {
    level: "advanced",
    title: "x402 vs Token-Gating",
    path: "/guides/x402-vs-token-gating",
    blurb: "Server-side 402 paywall vs on-chain token checks.",
  },
  {
    level: "advanced",
    title: "Give an Agent a Wallet Safely",
    path: "/guides/agent-wallet-safely",
    blurb: "Caps, allowlists, dry-run, never the main key.",
  },
  {
    level: "advanced",
    title: "Why Agent-Readable Matters",
    path: "/guides/agent-readable",
    blurb: "site.txt, llms.txt, curriculum JSON, well-known x402.",
  },
  {
    level: "advanced",
    title: "HTTP 402: 30 Years Dormant",
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
    description: "What Is x402, a practice wallet, then the Payment Loop.",
  },
  intermediate: {
    label: "Intermediate",
    description: "V2 headers and CAIP-2 (standard network id — genesis-hash form), then facilitators, then ship a paid route.",
  },
  advanced: {
    label: "Advanced / Agents",
    description: "Agent wallets, paywall design, and machine-readable surfaces.",
  },
};
