/**
 * Shared grading rules for 402 Checker (client display + server result shape).
 * Aligned with docs.x402.org HTTP 402 V2: PAYMENT-REQUIRED is the canonical
 * wire location; JSON body is a server convenience.
 */

export type GradeLevel = "pass" | "warn" | "fail";

export type GradeItem = {
  id: string;
  label: string;
  level: GradeLevel;
  hint: string;
};

export type GradeReport = {
  url: string;
  status: number | null;
  grade: "A" | "B" | "C" | "D" | "F";
  items: GradeItem[];
  bodyPreview?: string;
  error?: string;
};

function isSolanaPayTo(addr: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
}
function isEvmPayTo(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function header(headers: Record<string, string>, name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

function decodeBase64Json(raw: string): unknown | null {
  try {
    const json =
      typeof atob === "function"
        ? atob(raw)
        : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function looksCaip2(network: string) {
  return /^(solana|eip155|tvm|algorand|stellar|aptos|hedera|keeta|near|ccd|xrpl|cardano):/.test(
    network,
  );
}

export function grade402Response(params: {
  url: string;
  status: number;
  headers: Record<string, string>;
  bodyText: string;
}): GradeReport {
  const items: GradeItem[] = [];
  const { url, status, headers, bodyText } = params;

  if (status !== 402) {
    let hint = "Expected HTTP 402 Payment Required.";
    if (status === 200) hint = "Endpoint is free — middleware may not be active.";
    else if (status === 401 || status === 403)
      hint = "Auth may be intercepting before payment.";
    else if (status === 404) hint = "Route not found — check path.";
    items.push({
      id: "status",
      label: `HTTP status is 402 (got ${status})`,
      level: "fail",
      hint,
    });
  } else {
    items.push({
      id: "status",
      label: "HTTP status is 402",
      level: "pass",
      hint: "Correct payment challenge status.",
    });
  }

  const paymentRequiredRaw = header(headers, "payment-required");
  let fromHeader: unknown = null;
  if (paymentRequiredRaw) {
    fromHeader = decodeBase64Json(paymentRequiredRaw);
    items.push({
      id: "header",
      label: "PAYMENT-REQUIRED header present (canonical V2)",
      level: fromHeader ? "pass" : "warn",
      hint: fromHeader
        ? "Canonical V2 wire location (docs.x402.org). Base64 PaymentRequired decoded."
        : "Header present but did not decode as base64 JSON. It should be base64(PaymentRequired).",
    });
  } else {
    items.push({
      id: "header",
      label: "PAYMENT-REQUIRED header present (canonical V2)",
      level: "warn",
      hint: "V2 canonical location is PAYMENT-REQUIRED (base64 PaymentRequired). JSON body alone is a convenience, not the spec wire format.",
    });
  }

  let fromBody: unknown = null;
  try {
    fromBody = JSON.parse(bodyText);
    items.push({
      id: "json",
      label: "Body parses as JSON",
      level: "pass",
      hint: "Useful for humans and older clients. V2 still wants PAYMENT-REQUIRED on the wire.",
    });
  } catch {
    items.push({
      id: "json",
      label: "Body parses as JSON",
      level: fromHeader ? "warn" : "fail",
      hint: fromHeader
        ? "Body is not JSON; grading the decoded PAYMENT-REQUIRED header (canonical V2)."
        : "Return application/json and/or a base64 PAYMENT-REQUIRED header with PaymentRequired.",
    });
  }

  const json =
    fromHeader && typeof fromHeader === "object"
      ? fromHeader
      : fromBody && typeof fromBody === "object"
        ? fromBody
        : null;

  if (json && typeof json === "object") {
    const o = json as Record<string, unknown>;
    const version = o.x402Version;
    if (typeof version === "number") {
      items.push({
        id: "version",
        label: `x402Version present (v${version})`,
        level: "pass",
        hint:
          version >= 2
            ? "v2 shape detected."
            : "v1 shape — labs may still work; V2 uses CAIP-2 networks and PAYMENT-* headers.",
      });
    } else {
      items.push({
        id: "version",
        label: "x402Version is a number",
        level: "fail",
        hint: "Include numeric x402Version at top level.",
      });
    }

    const accepts = o.accepts;
    if (Array.isArray(accepts) && accepts.length > 0) {
      items.push({
        id: "accepts",
        label: "accepts[] is a non-empty array",
        level: "pass",
        hint: "Payment options listed.",
      });

      const required = [
        "scheme",
        "network",
        "payTo",
        "asset",
        "maxTimeoutSeconds",
      ] as const;

      const first = accepts[0] as Record<string, unknown>;
      const missing = required.filter((k) => first[k] === undefined || first[k] === "");
      const hasAmount =
        (typeof first.amount === "string" && first.amount !== "") ||
        (typeof first.maxAmountRequired === "string" && first.maxAmountRequired !== "");
      const hasResource =
        (typeof first.resource === "string" && first.resource !== "") ||
        (typeof first.mimeType === "string" && first.mimeType !== "") ||
        (o.resource !== undefined && typeof o.resource === "object");
      if (missing.length === 0 && hasAmount && hasResource) {
        items.push({
          id: "fields",
          label: "First accepts[] entry has required fields",
          level: "pass",
          hint: "scheme, network, amount|maxAmountRequired, resource (item or top-level), payTo, asset, maxTimeoutSeconds",
        });
      } else {
        const extra: string[] = [];
        if (!hasAmount) extra.push("amount|maxAmountRequired");
        if (!hasResource) extra.push("resource/mimeType or top-level resource");
        items.push({
          id: "fields",
          label: "First accepts[] entry has required fields",
          level: "fail",
          hint: `Missing: ${[...missing, ...extra].join(", ")}. Confirm against docs.x402.org.`,
        });
      }

      if (o.resource && typeof o.resource === "object") {
        items.push({
          id: "top-resource",
          label: "Top-level resource object (v2)",
          level: "pass",
          hint: "v2 ResourceInfo present.",
        });
      }

      const amountStr =
        typeof first.amount === "string"
          ? first.amount
          : typeof first.maxAmountRequired === "string"
            ? first.maxAmountRequired
            : undefined;
      if (typeof amountStr === "string" && /^\d+$/.test(amountStr)) {
        items.push({
          id: "amount",
          label: "amount / maxAmountRequired is a digit string",
          level: "pass",
          hint: "Atomic integer string (e.g. USDC 6-decimal base units).",
        });
      } else if (amountStr !== undefined) {
        items.push({
          id: "amount",
          label: "amount / maxAmountRequired is a digit string",
          level: "warn",
          hint: "Prefer atomic integer string (e.g. lamports / USDC base units).",
        });
      }

      const scheme = String(first.scheme ?? "");
      if (scheme === "exact") {
        items.push({
          id: "scheme",
          label: 'scheme is "exact"',
          level: "pass",
          hint: "Official production scheme on Solana (and the default on most networks). upto and batch-settlement are EVM-only in current docs.",
        });
      } else if (scheme) {
        items.push({
          id: "scheme",
          label: `scheme is "${scheme}" (not official exact)`,
          level: "warn",
          hint: 'docs.x402.org production schemes are exact, upto (EVM), and batch-settlement (EVM). Custom schemes (exact-lab, onchain-sol) are educational — clients that only implement exact will skip them.',
        });
      }

      const payTo = String(first.payTo ?? "");
      const network = String(first.network ?? "");
      const networkLc = network.toLowerCase();
      const solish = networkLc.includes("solana") || networkLc.startsWith("solana:");
      const evmish =
        networkLc.includes("base") ||
        networkLc.includes("ethereum") ||
        networkLc.startsWith("eip155:");

      if (typeof version === "number" && version >= 2) {
        if (looksCaip2(network)) {
          items.push({
            id: "caip2",
            label: "network is CAIP-2 (v2)",
            level: "pass",
            hint: "Matches docs.x402.org (e.g. solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp, eip155:8453).",
          });
        } else if (network) {
          items.push({
            id: "caip2",
            label: "network is CAIP-2 (v2)",
            level: "warn",
            hint: `Got "${network}". V2 expects CAIP-2 (solana:… / eip155:…), not v1 names like solana-devnet or base-sepolia.`,
          });
        }
      }

      if (solish && isSolanaPayTo(payTo)) {
        items.push({
          id: "payto",
          label: "payTo matches Solana-shaped address",
          level: "pass",
          hint: "Base58 pubkey looks plausible.",
        });
      } else if (evmish && isEvmPayTo(payTo)) {
        items.push({
          id: "payto",
          label: "payTo matches EVM-shaped address",
          level: "pass",
          hint: "0x address looks plausible.",
        });
      } else if (payTo) {
        items.push({
          id: "payto",
          label: "payTo plausible for network",
          level: "warn",
          hint: "Could not map network → address format; double-check payTo.",
        });
      }

      if (first.description || (o.resource && typeof o.resource === "object" && (o.resource as { description?: string }).description)) {
        items.push({
          id: "description",
          label: "description present (discovery)",
          level: "pass",
          hint: "Helps bazaar / agent discovery.",
        });
      } else {
        items.push({
          id: "description",
          label: "description present (discovery)",
          level: "warn",
          hint: "Add a human-readable description for agent marketplaces.",
        });
      }

      try {
        const u = new URL(url);
        const resource = String(first.resource ?? "");
        const topUrl =
          o.resource && typeof o.resource === "object"
            ? String((o.resource as { url?: string }).url ?? "")
            : "";
        const resourcePath = resource || topUrl;
        if (
          resourcePath &&
          (resourcePath === u.pathname ||
            resourcePath.endsWith(u.pathname) ||
            resourcePath === url)
        ) {
          items.push({
            id: "resource",
            label: "resource matches request path",
            level: "pass",
            hint: "Good.",
          });
        } else if (resourcePath) {
          items.push({
            id: "resource",
            label: "resource matches request path",
            level: "warn",
            hint: `resource is "${resourcePath}" vs path "${u.pathname}".`,
          });
        }
      } catch {
        /* ignore */
      }
    } else {
      items.push({
        id: "accepts",
        label: "accepts[] is a non-empty array",
        level: "fail",
        hint: "Include accepts with at least one payment option.",
      });
    }
  }

  const acah = header(headers, "access-control-allow-headers") || "";
  if (/payment-signature/i.test(acah)) {
    items.push({
      id: "cors",
      label: "CORS allows PAYMENT-SIGNATURE",
      level: "pass",
      hint: "V2 client retry header is allowed. X-PAYMENT is the legacy V1 alias.",
    });
  } else if (/x-payment/i.test(acah)) {
    items.push({
      id: "cors",
      label: "CORS allows X-PAYMENT (legacy V1)",
      level: "warn",
      hint: "Also allow PAYMENT-SIGNATURE (canonical V2). Keep X-PAYMENT only as a migration alias.",
    });
  } else {
    items.push({
      id: "cors",
      label: "CORS allows PAYMENT-SIGNATURE",
      level: "warn",
      hint: "Expose Access-Control-Allow-Headers: PAYMENT-SIGNATURE (and optionally X-PAYMENT) for browser agents. Check OPTIONS too.",
    });
  }

  const fails = items.filter((i) => i.level === "fail").length;
  const warns = items.filter((i) => i.level === "warn").length;
  let grade: GradeReport["grade"] = "A";
  if (fails >= 3) grade = "F";
  else if (fails === 2) grade = "D";
  else if (fails === 1) grade = "C";
  else if (warns >= 3) grade = "B";
  else if (warns >= 1) grade = "A";
  else grade = "A";
  if (status !== 402) grade = fails >= 2 ? "F" : "D";

  return {
    url,
    status,
    grade,
    items,
    bodyPreview: bodyText.slice(0, 1200),
  };
}

export function reportToText(r: GradeReport) {
  const lines = [
    `Ship x402 402 Checker report`,
    `URL: ${r.url}`,
    `HTTP: ${r.status ?? "n/a"}`,
    `Grade: ${r.grade}`,
    "",
    ...r.items.map((i) => `[${i.level.toUpperCase()}] ${i.label} — ${i.hint}`),
    "",
    "Grading follows docs.x402.org V2 (PAYMENT-REQUIRED / PAYMENT-SIGNATURE / PAYMENT-RESPONSE, CAIP-2).",
    "Free tool — tip at /donate",
  ];
  return lines.join("\n");
}
