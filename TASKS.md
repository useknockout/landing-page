# useknockout — Tasks

Single source of truth for what's done, what's next, what's deferred.
Last updated: 2026-05-03

---

## ✅ Done — landing page v0

- [x] Next.js 14 + Tailwind 3 + TypeScript scaffold
- [x] Brand tokens ported (colors, type, spacing, radius, shadow, motion)
- [x] Inter local fonts + JetBrains Mono CDN
- [x] Assets + fonts copied to `public/`
- [x] Core components: TopNav, Footer, Button, CodeBlock, CodeTabs, StatusPill
- [x] Marketing home: Hero, StatStrip, FeatureGrid, Endpoints, InstallStrip, Pricing, FAQ
- [x] Playground (visual mock — no live API)
- [x] Docs: layout, sidebar, Quickstart, `/remove` full reference
- [x] Endpoint stubs (`[slug]` dynamic) for the 9 other endpoints
- [x] SDK + self-hosting stubs
- [x] 404 + 500 error pages
- [x] OG / Twitter metadata + favicon
- [x] README

---

## 🚀 Ship-now blockers (today)

- [ ] **Pick CTA fallback target** (until auth ships). Options:
  - mailto `hi@useknockout.com?subject=Beta+access`
  - Tally/Typeform waitlist URL
  - GitHub repo
- [ ] Replace `/signup` + `/signin` hrefs in: TopNav, Hero, Pricing tiers
- [ ] Confirm support email exists (`hi@useknockout.com`?)
- [ ] `npm run build` passes locally
- [ ] `npm run typecheck` passes locally
- [ ] `vercel deploy --prod` from project dir
- [ ] Cloudflare DNS — A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`
- [ ] Wait for SSL issue (auto, ~5 min)
- [ ] Smoke test: `useknockout.com` loads, `www` redirects, OG card renders, 404 fires

---

## 🔥 Day 1–2 after launch — Auth + Tokens

Stack: Supabase Auth + Supabase Postgres.

- [ ] Create Supabase project, get URL + anon + service-role keys
- [ ] Install `@supabase/ssr` `@supabase/supabase-js`
- [ ] `lib/supabase/server.ts` + `lib/supabase/client.ts` helpers
- [ ] Schema:
  ```sql
  users (id uuid PK = auth.uid, email, tier text default 'free', stripe_customer_id, created_at)
  tokens (id, user_id FK, name, prefix text, hashed_token text unique, last_used_at, revoked_at, created_at)
  usage (id, user_id, token_id, endpoint, status, latency_ms, created_at)
  ```
- [ ] RLS policies: users see only their rows
- [ ] `/signin` page — Google OAuth + email magic link
- [ ] `/signup` redirects to `/signin` (Supabase handles new vs existing)
- [ ] Auth callback route `app/auth/callback/route.ts`
- [ ] Middleware to protect `/keys` route
- [ ] `/keys` dashboard page
  - List tokens (prefix only, last used, created)
  - Create token modal — show raw `kno_live_<32>` ONCE, copy button
  - Revoke button — sets `revoked_at`
- [ ] Update TopNav: "Sign in" → real link, after-login show user menu

---

## 💳 Day 2–3 — Stripe

- [ ] **Create new Stripe account** for useknockout (separate from automateflows)
- [ ] Complete KYC + bank verification (~1-3 day wait)
- [ ] Create products in Stripe:
  - "Pay-as-you-go" — metered, $0.005/image
  - "Volume" — metered, $0.003/image (custom contract)
- [ ] Env vars: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] `app/api/stripe/checkout/route.ts` — create Checkout Session, return URL
- [ ] `app/api/stripe/webhook/route.ts` — handle `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
- [ ] Wire pricing CTAs → checkout for "Pay-as-you-go", mailto for "Volume" + "Enterprise"
- [ ] 402 error wiring on backend → upgrade flow
- [ ] Set Stripe `statement_descriptor` to `USEKNOCKOUT`

---

## 🔌 Day 3 — Backend token verification

API lives at `useknockout--api.modal.run` (Modal/Python).

- [ ] API reads `Authorization: Bearer <token>` header
- [ ] Hash with SHA-256, query Supabase `tokens.hashed_token`
- [ ] If `revoked_at IS NOT NULL` → 401
- [ ] If hash miss → 401
- [ ] Update `tokens.last_used_at`
- [ ] Insert `usage` row per call
- [ ] Free tier quota check — if monthly count ≥ 50 and `users.tier = 'free'` → 402
- [ ] Rate limit per token: 60 req/min free, 600 paid (Redis or Modal Dict)
- [ ] Response headers: `x-knockout-latency`, `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-knockout-model`

---

## 🎮 Playground — real wiring

- [ ] `app/api/playground/route.ts` — server proxy to Modal API
- [ ] Public-beta token in env (`KNOCKOUT_BETA_TOKEN`) — never client
- [ ] Per-IP rate limit: 60/min via Vercel KV or Upstash Redis
- [ ] Wire "Run again" button → real fetch
- [ ] Wire "Upload your own…" → file picker + drag-drop multipart
- [ ] Surface real `x-knockout-latency` in pill
- [ ] Show real cutout result on canvas (replace static example)
- [ ] Error states wired (rate-limit, no-subject, payload-too-large)

---

## 📚 Docs — fill the stubs

Each follows the `/remove` template (already built). 20 endpoints total.

**Core**
- [x] `/docs/endpoints/remove` — full reference (DONE)
- [ ] `/docs/endpoints/remove-url`
- [ ] `/docs/endpoints/replace-bg`

**Batch**
- [ ] `/docs/endpoints/remove-batch`
- [ ] `/docs/endpoints/remove-batch-url`

**Cutout variants**
- [ ] `/docs/endpoints/mask`
- [ ] `/docs/endpoints/sticker`
- [ ] `/docs/endpoints/outline`
- [ ] `/docs/endpoints/smart-crop`

**Composition**
- [ ] `/docs/endpoints/shadow`
- [ ] `/docs/endpoints/studio-shot`
- [ ] `/docs/endpoints/headshot`
- [ ] `/docs/endpoints/compare`

**Enhancement**
- [ ] `/docs/endpoints/upscale` — Swin2SR default, `model=realesrgan` opt
- [ ] `/docs/endpoints/face-restore` — GFPGAN, optional bg upscale

**Utility**
- [ ] `/docs/endpoints/preview`
- [ ] `/docs/endpoints/estimate`
- [ ] `/docs/endpoints/health`
- [ ] `/docs/endpoints/stats`
- [ ] `/docs/endpoints/root`

**SDKs**
- [ ] `/docs/sdks/node` — full reference
- [ ] `/docs/sdks/react` — full reference
- [ ] `/docs/sdks/cli` — full reference
- [ ] `/docs/sdks/python` — full reference

**Self-hosting**
- [ ] `/docs/self-hosting/modal` — 4-command deploy + env + cost
- [ ] `/docs/self-hosting/byo-gpu` — Docker + bare-metal guide

---

## 📈 Post-launch — week 2

- [ ] **Status page** — `status.useknockout.com` (Better Stack or Statuspage)
- [ ] **Changelog page** + RSS at `/changelog/feed.xml`
- [ ] **Pricing detail page** for ad-campaign landings
- [ ] **Email templates**: welcome, quota warning, receipt (Stripe handles default)
- [ ] **Analytics** — Plausible or PostHog
- [ ] **Lucide icons** — replace Unicode `→` placeholders
- [ ] **Shiki** syntax highlighting for code blocks
- [ ] **MDX migration** for `/docs/**` pages

---

## 💰 Tax (deferred)

- [ ] Enable Stripe Tax when one of these triggers fires:
  - ARR > $100k (US economic nexus thresholds)
  - First EU / UK customer (VAT required)
  - Enterprise customer demands tax-compliant invoice
  - AZ Department of Revenue inquiry
- [ ] Register for sales tax permits in nexus states
- [ ] Wire `automatic_tax: { enabled: true }` to Checkout Session

---

## 🔒 Security checklist (before paying customers)

- [ ] Tokens hashed in DB (SHA-256), never stored raw
- [ ] Service role key only used in server routes
- [ ] Stripe webhook signature verified
- [ ] Rate limits enforced server-side
- [ ] Sentry or similar error monitoring wired
- [ ] Privacy policy + ToS pages drafted (basic legal review)
- [ ] DPA template ready for Volume/Enterprise customers
- [ ] CORS locked to known origins for `/api/*`

---

## 🌐 Domain + DNS

- [ ] Cloudflare DNS:
  - `A @ 76.76.21.21` (Vercel apex)
  - `CNAME www cname.vercel-dns.com`
  - `CNAME docs cname.vercel-dns.com` (if subdomain split later)
  - `CNAME status` (Better Stack value, when status page lives)
- [ ] Cloudflare proxy: **OFF** for Vercel records (orange → grey cloud)
- [ ] Vercel: add `useknockout.com` + `www.useknockout.com` to project
- [ ] SSL auto-issue confirmed
- [ ] Update `metadataBase` in `app/layout.tsx` if needed

---

## ❓ Open questions

- [ ] Confirm GitHub repo URL `github.com/useknockout/api` — README placeholder or real?
- [ ] Is the existing Modal endpoint `useknockout--api.modal.run` ready or needs migration?
- [ ] Public-beta playground rate limit — 60/min/IP confirmed?
- [ ] Webhooks v1 or v2 — affects docs sidebar
- [ ] Support email — `hi@useknockout.com` or different?
- [ ] Sales email — `sales@useknockout.com` or different?
