/**
 * Paste-ready x402 seller snippets — aligned with docs.x402.org
 * seller quickstart (2026): @x402/* v2 shape.
 *
 * paymentMiddleware(routesConfig, x402ResourceServer)
 * Networks use CAIP-2 IDs. Always re-check https://docs.x402.org before prod.
 */

export type ShipFramework = "express" | "next" | "hono";
export type ShipNetwork =
  | "solana-devnet"
  | "solana"
  | "base-sepolia"
  | "base";

export type ShipForm = {
  framework: ShipFramework;
  network: ShipNetwork;
  priceUsd: string;
  payTo: string;
  route: string;
  description: string;
  inputSchema?: string;
  outputSchema?: string;
};

export const FACILITATOR_TEST = "https://x402.org/facilitator";
export const FACILITATOR_PAYAI = "https://facilitator.payai.network";

/** CAIP-2 network IDs used by current @x402 packages */
export const CAIP2: Record<ShipNetwork, string> = {
  "solana-devnet": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  solana: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  "base-sepolia": "eip155:84532",
  base: "eip155:8453",
};

export function isMainnet(network: ShipNetwork) {
  return network === "solana" || network === "base";
}

export function isSolanaNetwork(network: ShipNetwork) {
  return network === "solana" || network === "solana-devnet";
}

export function validatePayTo(network: ShipNetwork, address: string): string | null {
  const a = address.trim();
  if (!a) return "Enter a receiving wallet address";
  if (isSolanaNetwork(network)) {
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a)) {
      return "Solana address must be base58 (32–44 chars, no 0/O/I/l)";
    }
    return null;
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(a)) {
    return "EVM address must be 0x + 40 hex characters";
  }
  return null;
}

export function installLine(framework: ShipFramework) {
  switch (framework) {
    case "express":
      return "npm install @x402/express @x402/core @x402/evm @x402/svm";
    case "next":
      return "npm install @x402/next @x402/core @x402/evm @x402/svm";
    case "hono":
      return "npm install @x402/hono @x402/core @x402/evm @x402/svm";
  }
}

function facilitatorFor(network: ShipNetwork, production: boolean) {
  if (!production || !isMainnet(network)) return FACILITATOR_TEST;
  return FACILITATOR_PAYAI;
}

function priceKey(priceUsd: string) {
  const n = Number(priceUsd);
  if (!Number.isFinite(n) || n <= 0) return "$0.01";
  const fixed = n.toFixed(6).replace(/\.?0+$/, "");
  return `$${fixed}`;
}

function resolvedNetwork(form: ShipForm, production: boolean): ShipNetwork {
  if (!production) return form.network;
  if (form.network === "solana-devnet") return "solana";
  if (form.network === "base-sepolia") return "base";
  return form.network;
}

function routeKey(route: string) {
  const r = route.startsWith("/") ? route : `/${route}`;
  // docs often use "GET /path"
  return r.startsWith("GET ") || r.startsWith("POST ") ? r : `GET ${r}`;
}

function pathOnly(route: string) {
  const r = route.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/i, "");
  return r.startsWith("/") ? r : `/${r}`;
}

function schemeRegisterLines(network: ShipNetwork) {
  if (isSolanaNetwork(network)) {
    return {
      importLine: `import { ExactSvmScheme } from "@x402/svm/exact/server";`,
      register: `.register("${CAIP2[network]}", new ExactSvmScheme())`,
      wildcard: `.register("solana:*", new ExactSvmScheme())`,
    };
  }
  return {
    importLine: `import { ExactEvmScheme } from "@x402/evm/exact/server";`,
    register: `.register("${CAIP2[network]}", new ExactEvmScheme())`,
    wildcard: `.register("eip155:*", new ExactEvmScheme())`,
  };
}

function acceptsBlock(form: ShipForm, caip: string, price: string) {
  return `{
            scheme: "exact",
            price: "${price}",
            network: "${caip}",
            payTo: payTo,
          }`;
}

export function codeSnippet(form: ShipForm, production = false) {
  const price = priceKey(form.priceUsd);
  const net = resolvedNetwork(form, production);
  const caip = CAIP2[net];
  const facilitator = facilitatorFor(form.network, production);
  const rk = routeKey(form.route);
  const path = pathOnly(form.route);
  const desc = form.description.replace(/`/g, "'").replace(/"/g, '\\"');
  const scheme = schemeRegisterLines(net);
  const accepts = acceptsBlock(form, caip, price);

  const routesConfig = `{
      "${rk}": {
        accepts: [
          ${accepts},
        ],
        description: "${desc}",
        mimeType: "application/json",
      },
    }`;

  if (form.framework === "express") {
    return `// @x402/express v2 shape — from docs.x402.org seller quickstart
// Verify against https://docs.x402.org before production (APIs evolve).
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
${scheme.importLine}

const app = express();
const payTo = process.env.X402_PAY_TO!; // ${form.payTo.trim()}

const facilitatorClient = new HTTPFacilitatorClient({
  url: process.env.X402_FACILITATOR_URL ?? "${facilitator}",
});

app.use(
  paymentMiddleware(
    ${routesConfig},
    new x402ResourceServer(facilitatorClient)
      ${scheme.register},
  ),
);

app.get("${path}", (_req, res) => {
  res.json({ ok: true, message: "Paid access granted" });
});

app.listen(3000);`;
  }

  if (form.framework === "hono") {
    return `// @x402/hono v2 shape — docs.x402.org seller quickstart
import { Hono } from "hono";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { HTTPFacilitatorClient } from "@x402/core/server";
${scheme.importLine}

const app = new Hono();
const payTo = process.env.X402_PAY_TO!; // ${form.payTo.trim()}

const facilitatorClient = new HTTPFacilitatorClient({
  url: process.env.X402_FACILITATOR_URL ?? "${facilitator}",
});

app.use(
  paymentMiddleware(
    ${routesConfig},
    new x402ResourceServer(facilitatorClient)
      ${scheme.register},
  ),
);

app.get("${path}", (c) => c.json({ ok: true, message: "Paid access granted" }));

export default app;`;
  }

  // Next.js — paymentProxy + withX402 pattern from docs
  return `// @x402/next v2 — proxy.ts pattern from docs.x402.org
// Also see withX402() for App Router API route handlers.
import { paymentProxy } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
${scheme.importLine}

const payTo = process.env.X402_PAY_TO!; // ${form.payTo.trim()}

const facilitatorClient = new HTTPFacilitatorClient({
  url: process.env.X402_FACILITATOR_URL ?? "${facilitator}",
});

export const server = new x402ResourceServer(facilitatorClient);
server${scheme.wildcard};

export const proxy = paymentProxy(
  {
    "${path}": {
      accepts: [
        ${accepts},
      ],
      description: "${desc}",
      mimeType: "application/json",
    },
  },
  server,
);

// Example API route: export const GET = withX402(handler, { accepts: [...] }, server);
// Import withX402 from "@x402/next" and reuse the same accepts block.`;
}

export function envSnippet(form: ShipForm, production = false) {
  const facilitator = facilitatorFor(form.network, production);
  const net = resolvedNetwork(form, production);
  return `# Receiving wallet (public address only — never a private key)
X402_PAY_TO=${form.payTo.trim()}

# Facilitator
X402_FACILITATOR_URL=${facilitator}

# Network (CAIP-2): ${CAIP2[net]}
`;
}

export function testCurl(form: ShipForm) {
  const path = pathOnly(form.route);
  return `# Expect HTTP 402 + JSON requirements (accepts[])
curl -i "http://localhost:3000${path}"

# Validate the 402 body:
# https://shipx402.com/check
`;
}

export function agentPrompt(form: ShipForm) {
  const net = form.network;
  const caip = CAIP2[net];
  return `Build an x402 paid API using ${form.framework} and current @x402/* v2 packages.
Use paymentMiddleware(routesConfig, x402ResourceServer) — NOT the old payTo-first signature.
Network CAIP-2: ${caip}
Price: ${priceKey(form.priceUsd)}
payTo: ${form.payTo}
Route: ${routeKey(form.route)}
Description: ${form.description}
Install: ${installLine(form.framework)}
Register ExactSvmScheme or ExactEvmScheme for the network.
Facilitator test: ${FACILITATOR_TEST}; production: PayAI or Coinbase CDP.
Verify against https://docs.x402.org then validate with https://shipx402.com/check`;
}
