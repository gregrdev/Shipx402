import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { DONATION_ADDRESS, assertDonationAddressValid } from "@/lib/donate";
import { cn } from "@/lib/utils";

/**
 * Donation QR generated at runtime from DONATION_ADDRESS only.
 * Never uses a static image — payload is always `solana:<address>` so it
 * cannot drift from the configured payTo.
 */
export function donationPayUri(address = DONATION_ADDRESS) {
  return `solana:${address.trim()}`;
}

export function DonationQr({
  className,
  size = 256,
  showPayload = true,
}: {
  className?: string;
  size?: number;
  showPayload?: boolean;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uri = donationPayUri(DONATION_ADDRESS);
  const valid = assertDonationAddressValid(DONATION_ADDRESS);

  useEffect(() => {
    if (!valid) {
      setError("Donation address is not a valid Solana public key");
      setDataUrl(null);
      return;
    }
    let cancelled = false;
    void QRCode.toDataURL(uri, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0b0d", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not generate QR");
      });
    return () => {
      cancelled = true;
    };
  }, [uri, size, valid]);

  return (
    <div className={cn("text-center", className)}>
      <div className="mx-auto inline-block rounded-[1.25rem] border border-border bg-bg p-2 shadow-[0_0_40px_-12px_rgba(45,212,191,0.35)]">
        <div className="overflow-hidden rounded-[1rem] bg-white p-2 sm:p-3">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`Solana Pay QR encoding ${uri}`}
              width={size}
              height={size}
              className="mx-auto block"
              // data URLs are generated here; no external request
            />
          ) : (
            <div
              className="flex items-center justify-center text-sm text-subtle"
              style={{ width: size, height: size }}
            >
              {error ?? "Generating QR…"}
            </div>
          )}
        </div>
      </div>
      {showPayload && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-subtle">
            Generated from address · not a static image
          </p>
          <p className="break-all font-mono text-[10px] text-muted sm:text-xs">
            Encodes: {uri}
          </p>
          {valid ? (
            <p className="text-xs text-success">Address checksum OK (base58 pubkey)</p>
          ) : (
            <p className="text-xs text-danger">Invalid address — do not accept funds</p>
          )}
        </div>
      )}
    </div>
  );
}
