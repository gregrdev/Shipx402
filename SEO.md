# Ship x402 SEO — deploy notes

## Architecture
| Surface | Path | SSR |
|--------|------|-----|
| Marketing home | `/` | yes |
| Learn hub | `/learn` | yes |
| Wallet explainer | `/wallet` | yes |
| Agents | `/agents` | yes |
| Donate | `/donate` | yes |
| Guide: x402 vs MPP | `/guides/x402-vs-mpp` | yes |
| Guide: ship API | `/guides/ship-x402-api-solana` | yes |
| Interactive wallet | `/app` | **no** (Web Crypto) |
| Agent map | `/llms.txt` | static |
| robots | `/robots.txt` | static |
| Sitemap | `/sitemap.xml` | static |

## Guardrails (do not break)
- Wallet encryption / PBKDF2 / AES-GCM
- Session auto-lock & secret handling
- `/api/x402/lab` and `/api/x402/donate` verification

## Human steps after deploy
1. Set `SITE_URL` or `VITE_SITE_URL` to `https://www.shipx402.com` (canonical + OG absolute URLs; apex redirects to www).
2. View **page source** on `/learn` and `/guides/x402-vs-mpp` — confirm titles and body text in raw HTML (not only after JS).
3. Submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
4. Optional: replace `/public/og.svg` with a designed 1200×630 PNG and point `seo.tsx` at it.

## Brand
Primary name: **Ship x402**. Independence disclaimer is in site footer chrome.
