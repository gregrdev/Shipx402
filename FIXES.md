# EZSolWallet — Security & Quality Fixes (prioritized)

Audit date: 2026-08-04. Written so an AI app builder can implement each item directly.
Overall: architecture is sound (client-side keys, no persistence of secrets, AES-GCM
backups, no XSS sinks found, typecheck clean). Items below harden it further.

## P0 — before promoting mainnet use

1. **~~Add a strict Content-Security-Policy and clickjacking protection.~~ DONE**
   Production-only via Nitro `routeRules` in `vite.config.ts` (build) + `vercel.json`.
   Dev unrestricted for HMR. Headers: CSP (script-src 'self', frame-ancestors 'none',
   base-uri 'none'), X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy,
   Permissions-Policy, COOP. See `src/lib/security-headers.ts`.

2. **Use a dedicated RPC endpoint for mainnet.** `clusterApiUrl("mainnet-beta")`
   (api.mainnet-beta.solana.com) rate-limits browsers hard; sends will fail for real
   users. Read from `import.meta.env.VITE_SOLANA_RPC_URL` (client) and
   `process.env.SOLANA_RPC_URL` (server /api/x402/donate) with the public URL only as
   fallback. Free tiers: Helius, QuickNode, Triton.

3. **Handle the "timeout after broadcast" send case.** `sendAndConfirmTransaction`
   can throw after the tx was actually submitted, so the UI says "failed" while money
   moved. On error, show the last signature (if available) with an explorer link and
   the message "check the explorer before retrying — the transfer may have gone
   through." Prevents accidental double-sends.

4. **Raise backup-password strength.** Files land in Downloads/cloud drives, so the
   threat model is offline brute force. Bump PBKDF2 iterations 310k → 600k (OWASP
   2023) — keep `iterations` read from the file on decrypt so old backups still open —
   and encourage a 4+ word passphrase (add a strength meter, e.g. zxcvbn, and warn
   below ~60 bits).

## P1 — high value

5. **Offer a BIP39 seed phrase path (or at least explain its absence).** The app
   uses raw base58 secret keys. Hand-copying 88 chars is error-prone (one wrong char
   anywhere except the checked last 6 = unrecoverable), and users can't restore into
   Phantom/Solflare by phrase (Phantom does accept base58 private-key import — say
   so explicitly in the UI). Ideal: generate a 12/24-word mnemonic with standard
   Solana derivation `m/44'/501'/0'/0'` so backups are cross-wallet portable, words
   have a checksum, and the write-down ceremony matches industry norms.

6. **x402 lab: track nonces to actually prevent replay.** `verifyLabPayment` checks
   a 2-minute timestamp window but the same proof verifies repeatedly within it.
   Since the lab *teaches* the protocol, teach replay protection: keep an in-memory
   `Set` of seen nonces (like the donate endpoint's signature set) and reject reuse.
   Also: the `payTo` param in `verifyLabPayment` is accepted but never checked —
   either verify it or drop it.

7. **~~Fix the lab's example address.~~ DONE**
   Lab payTo is a generated example merchant pubkey
   (`DEUuczkZU3Mj9Jf62LTLKSKi54WvBSFwiYmEnKyJszvu`) labeled in the 402 body.

8. **Strip unused scaffolding for supply-chain hygiene.** `src/lib/auth/*`,
   `src/lib/multiplayer/*`, `src/lib/db.ts` are imported by nothing in the app, yet
   `better-auth`, `pglite`, `kysely`, `pg` stay installed and `build` runs
   `db:migrate`. For wallet software, every dependency is attack surface (npm
   supply-chain attacks target crypto apps specifically). Remove the dead code +
   deps, keep the lockfile committed, run `npm audit` in CI, and avoid `^` drift for
   crypto-adjacent packages (consider exact-pinning @solana/web3.js, bs58,
   tweetnacl).

9. **Self-host fonts.** Google Fonts adds a third-party request from a wallet page
   (privacy + one more party in the CSP). Bundle DM Sans + JetBrains Mono locally.

## P2 — polish

10. **Clipboard honesty.** The 45s auto-clear can't touch clipboard *history*
    (Windows Win+V, clipboard managers) and `readText` is often blocked. Keep the
    feature, but change the copy toast to say history managers may retain it, and
    visually prefer "write it down / backup file" over the copy button.

11. **`beforeunload` fires on every refresh** — nags users constantly. Only register
    it when a wallet is unlocked AND balance > 0, or drop it (auto-lock already
    covers the risk).

12. **Vanity grinding on the main thread** — move the 150k-keypair loop to a Web
    Worker so mobile doesn't jank; show a cancel button.

13. **`WebkitTextSecurity` masking (import textarea) doesn't work in Firefox** —
    the pasted key shows in plaintext there. Acceptable, but consider a password
    input + "show" toggle pattern instead.

14. **Mainnet gating.** Consider hiding "Real mode" until the user has completed
    the Learn flow once (store a flag) — beginners shouldn't meet mainnet first.

15. **Docs truth pass on x402.** The protocol moved fast in 2026: x402 is now
    governed by the x402 Foundation under the Linux Foundation; the v2 spec uses
    CAIP-2 network IDs; Coinbase's CDP facilitator supports Solana (free tier
    ~1,000 tx/month) and PayAI runs a large public Solana facilitator. Update the
    "Lab vs production" table + links (x402.org, docs.cdp.coinbase.com/x402,
    npm `x402-solana`).

16. **Donations setup (new feature included in this bundle).**
    - Set `DONATION_ADDRESS` in `src/lib/donate.ts` (mainnet public address only).
    - Optionally set `SOLANA_RPC_URL` env for reliable on-chain verification.
    - New files: `src/lib/donate.ts`, `src/components/donate-panel.tsx`,
      `src/routes/api/x402/donate.ts`. Wired into the dashboard (Donate tab) and
      the welcome page footer section. `routeTree.gen.ts` regenerates on dev.
    - **Get your receipt** on the human donate card: paste a mainnet tx signature to
      exercise the live happy path (same X-PAYMENT verify as agents).
