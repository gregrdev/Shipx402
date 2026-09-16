import { isIP } from "node:net";

/**
 * SSRF helper: treat private / reserved / unrecognised addresses as blocked.
 *
 * IPv4-mapped IPv6 (`::ffff:x.x.x.x` and `::ffff:aabb:ccdd`) is classified as
 * the embedded IPv4 address — the previous `:ffff:` prefix never matched
 * Node's `::ffff:` form.
 */

function normalizeIp(ip: string): string {
  let s = ip.trim().toLowerCase();
  if (s.startsWith("[") && s.endsWith("]")) s = s.slice(1, -1);
  const zone = s.indexOf("%");
  if (zone !== -1) s = s.slice(0, zone);
  return s;
}

/** Extract dotted IPv4 from IPv4-mapped IPv6, or null. */
export function mappedIpv4FromV6(ip: string): string | null {
  const lower = normalizeIp(ip);
  const dotted = lower.match(/^(?:0:){5}ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (dotted) return dotted[1]!;
  const dottedShort = lower.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (dottedShort) return dottedShort[1]!;
  const hex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const a = Number.parseInt(hex[1]!, 16);
    const b = Number.parseInt(hex[2]!, 16);
    return `${(a >> 8) & 255}.${a & 255}.${(b >> 8) & 255}.${b & 255}`;
  }
  return null;
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b !== undefined && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b !== undefined && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const mapped = mappedIpv4FromV6(ip);
  if (mapped) return isPrivateIp(mapped);

  if (ip === "::1" || ip === "::") return true;

  const firstGroup = ip.split(":")[0] ?? "";
  if (firstGroup === "") {
    // Compressed form starting with `::` other than loopback / mapped / unspecified.
    return true;
  }
  const first = Number.parseInt(firstGroup, 16);
  if (!Number.isFinite(first)) return true;

  // Unique local fc00::/7, link-local fe80::/10, multicast ff00::/8
  if (first >= 0xfc00 && first <= 0xfdff) return true;
  if (first >= 0xfe80 && first <= 0xfebf) return true;
  if (first >= 0xff00) return true;

  // Documentation 2001:db8::/32
  if (ip === "2001:db8" || ip.startsWith("2001:db8:")) return true;

  // Global unicast 2000::/3
  if (first >= 0x2000 && first <= 0x3fff) return false;

  // Unrecognised IPv6 form — fail closed (treat as blocked).
  return true;
}

export function isPrivateIp(ip: string): boolean {
  const normalized = normalizeIp(ip);
  const v = isIP(normalized);
  if (v === 4) return isPrivateIpv4(normalized);
  if (v === 6) return isPrivateIpv6(normalized);
  return true;
}
