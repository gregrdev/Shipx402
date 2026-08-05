/**
 * Shared grading rules for 402 Checker (client display + server result shape).
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

  let json: unknown = null;
  try {
    json = JSON.parse(bodyText);
    items.push({
      id: "json",
      label: "Body parses as JSON",
      level: "pass",
      hint: "Good.",
    });
  } catch {
    items.push({
      id: "json",
      label: "Body parses as JSON",
      level: "fail",
      hint: "Return application/json with an x402 requirements object.",
    });
  }

  if (json && typeof json === "object") {
    const o = json as Record<string, unknown>;
    const version = o.x402Version;
    if (typeof version === "number") {
      items.push({
        id: "version",
        label: `x402Version present (v${version})`,
        level: "pass",
        hint: version >= 2 ? "v2 shape detected." : "v1 shape — fine for labs; v2 uses CAIP-2 networks.",
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
          hint: "Good.",
        });
      } else if (amountStr !== undefined) {
        items.push({
          id: "amount",
          label: "amount / maxAmountRequired is a digit string",
          level: "warn",
          hint: "Prefer atomic integer string (e.g. lamports / base units).",
        });
      }

      const payTo = String(first.payTo ?? "");
      const network = String(first.network ?? "").toLowerCase();
      const solish = network.includes("solana") || network.startsWith("solana:");
      const evmish =
        network.includes("base") ||
        network.includes("ethereum") ||
        network.startsWith("eip155:");
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

      if (first.description) {
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
        if (resource && (resource === u.pathname || resource.endsWith(u.pathname))) {
          items.push({
            id: "resource",
            label: "resource matches request path",
            level: "pass",
            hint: "Good.",
          });
        } else if (resource) {
          items.push({
            id: "resource",
            label: "resource matches request path",
            level: "warn",
            hint: `resource is "${resource}" vs path "${u.pathname}".`,
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

  const pr =
    headers["payment-required"] ||
    headers["PAYMENT-REQUIRED"] ||
    headers["payment-required".toLowerCase()];
  if (pr) {
    items.push({
      id: "header",
      label: "PAYMENT-REQUIRED header present",
      level: "pass",
      hint: "Optional but agent-friendly.",
    });
  } else {
    items.push({
      id: "header",
      label: "PAYMENT-REQUIRED header present",
      level: "warn",
      hint: "Consider base64 PAYMENT-REQUIRED header alongside JSON body.",
    });
  }

  const acah = headers["access-control-allow-headers"] || "";
  if (/x-payment/i.test(acah) || /payment-signature/i.test(acah)) {
    items.push({
      id: "cors",
      label: "CORS allows X-PAYMENT (from this response)",
      level: "pass",
      hint: "Header list includes payment headers.",
    });
  } else {
    items.push({
      id: "cors",
      label: "CORS allows X-PAYMENT",
      level: "warn",
      hint: "Expose Access-Control-Allow-Headers: X-PAYMENT for browser agents (check OPTIONS too).",
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
    ...r.items.map(
      (i) => `[${i.level.toUpperCase()}] ${i.label} — ${i.hint}`,
    ),
    "",
    "Free tool — tip at /donate",
  ];
  return lines.join("\n");
}
