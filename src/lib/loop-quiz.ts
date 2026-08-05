/**
 * Knowledge check for the /loop walkthrough.
 * All answers come from public Ship x402 guides — educational only.
 * Passing earns a free certificate. Tips are never required.
 */

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: readonly string[];
  /** Index into choices */
  answer: number;
  explain: string;
};

export const LOOP_PASS_THRESHOLD = 0.8;

export const LOOP_QUIZ: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt: "What does HTTP 402 mean in x402?",
    choices: [
      "The server is overloaded",
      "Payment is required before the resource is returned",
      "Your API key expired",
      "The blockchain is offline",
    ],
    answer: 1,
    explain:
      "x402 revives HTTP 402 Payment Required so clients can pay per request instead of using accounts and API keys.",
  },
  {
    id: "q2",
    prompt: "In the x402 payment loop, what happens after a client receives a 402?",
    choices: [
      "The client creates an account on the merchant site",
      "The client reads the price, pays, then retries with proof",
      "The server emails an invoice",
      "The request is permanently denied",
    ],
    answer: 1,
    explain:
      "Request → 402 with requirements → client pays → client retries with a payment header → server unlocks the resource.",
  },
  {
    id: "q3",
    prompt: "What is a facilitator in x402?",
    choices: [
      "A wallet that stores your private keys",
      "A service that helps verify and settle payments so sellers need less chain ops",
      "A Solana RPC node only",
      "An NFT marketplace",
    ],
    answer: 1,
    explain:
      "Facilitators verify and settle payments (e.g. CDP, PayAI). Merchants can also self-host or use custom on-chain schemes.",
  },
  {
    id: "q4",
    prompt: "What is the “blind transfer” problem?",
    choices: [
      "Sending SOL without a memo field",
      "Publishing only a wallet address so a payer has no machine-readable price or proof path",
      "Using Devnet instead of mainnet",
      "Running two facilitators at once",
    ],
    answer: 1,
    explain:
      "A bare address is not a payment API. x402 gives amount, network, asset, and a retry-with-proof flow.",
  },
  {
    id: "q5",
    prompt: "Which field style does x402 v2 prefer for network identity?",
    choices: [
      "Only the string “solana”",
      "CAIP-2 network ids (e.g. solana:…)",
      "IP addresses of validators",
      "Twitter handles",
    ],
    answer: 1,
    explain:
      "v2 uses CAIP-2 network identifiers. Good servers keep legacy mirrors so older clients still work.",
  },
  {
    id: "q6",
    prompt: "Safe practice when giving an AI agent a wallet:",
    choices: [
      "Reuse your main life savings key",
      "Separate key, spend limits, allowlists, and dry-run first",
      "Paste the seed into the agent chat",
      "Disable all network restrictions",
    ],
    answer: 1,
    explain:
      "Agents need guardrails: dedicated keys, caps, allowlisted endpoints/payTo, and human gates for mainnet.",
  },
  {
    id: "q7",
    prompt: "Ship x402’s practice wallet stores private keys where?",
    choices: [
      "On the Ship x402 server database",
      "Only in the browser / local device (client-side)",
      "In a public GitHub repo",
      "Inside the 402 response body",
    ],
    answer: 1,
    explain:
      "Keys are generated and stay client-side. Never paste a private key into a website that asks for it.",
  },
  {
    id: "q8",
    prompt: "What should an agent show a human before signing a payment?",
    choices: [
      "Only the facilitator brand logo",
      "Amount, network, asset, and payTo",
      "Nothing — agents should auto-pay always",
      "The full seed phrase",
    ],
    answer: 1,
    explain:
      "Surface amount, network, asset, and payTo before any signature. That is core agent safety.",
  },
  {
    id: "q9",
    prompt: "Devnet SOL is best used for:",
    choices: [
      "Buying coffee IRL",
      "Risk-free practice of wallets and payment flows",
      "Paying production API invoices",
      "Tax-deductible donations",
    ],
    answer: 1,
    explain:
      "Practice on Devnet first. Mainnet moves real value and needs explicit human consent.",
  },
  {
    id: "q10",
    prompt: "Is this free certificate a professional license?",
    choices: [
      "Yes — it qualifies you as a licensed payment processor",
      "No — it only confirms you completed Ship x402’s educational walkthrough",
      "Yes — it is recognized by the Linux Foundation automatically",
      "It is a securities registration",
    ],
    answer: 1,
    explain:
      "The certificate is educational completion only — not accreditation, employment credential, or license.",
  },
] as const;

export function scoreQuiz(answers: Record<string, number>) {
  let correct = 0;
  for (const q of LOOP_QUIZ) {
    if (answers[q.id] === q.answer) correct += 1;
  }
  const total = LOOP_QUIZ.length;
  const ratio = total === 0 ? 0 : correct / total;
  return {
    correct,
    total,
    ratio,
    passed: ratio >= LOOP_PASS_THRESHOLD,
  };
}

/** Stable, non-secret id for sharing (not a security proof). */
export function makeCertId(name: string, score: number, total: number, at: Date) {
  const raw = `${name.trim().toLowerCase()}|${score}/${total}|${at.toISOString().slice(0, 10)}|shipx402`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0").toUpperCase();
  return `SX402-${at.getUTCFullYear()}-${hex}`;
}
