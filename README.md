# Ship x402

Learn x402. Ship pay-per-request APIs on Solana.

**Live product surface**
- `/` — marketing home (SSR)
- `/learn` — learn x402
- `/app` — practice Solana wallet (client-side keys)
- `/ship` — x402 middleware generator
- `/check` — 402 endpoint checker
- `/donate` — Solana tips + agent x402 donate API
- `/llms.txt` — machine-readable site map

## Quick start

```bash
npm install
npm run dev
```

App binds `0.0.0.0:8080`.

## Production

```bash
npm run build
npm run typecheck
```

Set on the host:

```text
SITE_URL=https://shipx402.com
```

Optional RPC for donation verification (see `src/lib` donate / solana config).

Durable donation receipt replay (required in production): set
`KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel KV / Upstash). Local/dev
falls back to `data/credited-donation-sigs/` (gitignored). Receipts fail
closed if the store cannot claim a signature.

## Deploy notes

- Stack: TanStack Start + Vite + Nitro (Vercel preset on build)
- Donation address: `src/lib/donate.ts` (public only — never a private key)
- QR codes are generated from that address at runtime

Independent educational project — not affiliated with Coinbase, the x402 Foundation, or Solana Foundation.
