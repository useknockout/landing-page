# useknockout-landing-page

Public website for [**useknockout**](https://useknockout.com) — open-source background-removal API. Marketing home, docs, playground, and error pages.

Built from the design handoff at `..\useknockout-web-app\design_handoff_useknockout`.

## Stack

- **Next.js 14.2** (App Router, TypeScript)
- **Tailwind CSS 3.4** with brand tokens in `tailwind.config.ts` + CSS vars in `app/globals.css`
- **next/font/local** for Inter (TTFs in `public/fonts/`); Google Fonts CDN for JetBrains Mono + Inter weights 500/600
- No external icon library yet — Unicode arrows are placeholders per handoff §2 (swap to Lucide later)

## Run

```bash
npm install
npm run dev
# open http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve build output
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## Routes

| Path                            | Source                                                | Status |
|---------------------------------|-------------------------------------------------------|--------|
| `/`                             | `app/page.tsx`                                        | hi-fi  |
| `/playground`                   | `app/playground/page.tsx` + `Playground.tsx`          | visual mock — no live API yet |
| `/docs`                         | `app/docs/page.tsx`                                   | quickstart |
| `/docs/endpoints/remove`        | `app/docs/endpoints/remove/page.tsx`                  | full reference |
| `/docs/endpoints/[slug]`        | `app/docs/endpoints/[slug]/page.tsx`                  | "coming soon" stub |
| `/docs/sdks/[slug]`             | `app/docs/sdks/[slug]/page.tsx`                       | "coming soon" stub |
| `/docs/self-hosting/[slug]`     | `app/docs/self-hosting/[slug]/page.tsx`               | "coming soon" stub |
| `/<anything else>`              | `app/not-found.tsx`                                   | 404 — "knocked out" |
| runtime exception               | `app/error.tsx`                                       | 500 — dark, ASCII art |

## Brand tokens

Source of truth: `..\useknockout-web-app\design_handoff_useknockout\brand\colors_and_type.css` and `brand/README.md`.

Ported into:

- **`tailwind.config.ts`** — `kno-green`, `kno-black`, `kno-bg-dark`, etc.; full type scale, radius, shadow, motion tokens
- **`app/globals.css`** — same values as CSS custom properties for non-Tailwind consumers (e.g. inline styles in components)

Approved color pairings: `#57C985` on `#050505`, `#FFFFFF` on `#050505`, `#050505` on `#FFFFFF`. Forbidden: green on white surface, gradients, glows.

## Deferred (out of v0 scope)

These are explicitly deferred per handoff §1 / §11. Each is a clean follow-up PR:

- Auth, token issuance (`/keys`), Stripe billing, dashboard
- Real playground API calls (rate-limited public-beta token, file upload)
- Status page (`status.useknockout.com`)
- Changelog page + RSS
- Email templates
- Pricing detail page (homepage section is enough until ad-campaign landings need their own surface)
- Lucide icon migration
- MDX docs migration (currently hand-authored TSX)
- Shiki syntax highlighting (currently plain `<pre>`)
- Build out remaining 9 endpoint reference pages (`/replace-bg`, `/sticker`, `/studio-shot`, `/mask`, `/smart-crop`, `/shadow`, `/compare`, `/outline`, `/health`) — each follows the `/remove` template

## Verification checklist

- [ ] Marketing home renders all 8 sections in order
- [ ] cURL snippet copies to clipboard with "Copied" feedback
- [ ] Install-strip tabs switch the snippet
- [ ] Pricing card 2 shows "Most popular" pill + dark border
- [ ] FAQ accordion expands one item at a time
- [ ] `/playground` 2-panel layout above 1024px, stacks below
- [ ] `/docs` 3-column layout, sidebar links navigate correctly
- [ ] `/docs/endpoints/remove` shows full reference (params / request / response / errors)
- [ ] `/something-fake` triggers `not-found.tsx`
- [ ] OG metadata: `view-source:` shows `/og-card.png`, `summary_large_image`
- [ ] `npm run build` and `npm run typecheck` succeed

## Deploy

Per handoff §7 — host on **Vercel**, point `useknockout.com`, `docs.useknockout.com`, `status.useknockout.com` at the same project (status can be a separate provider).

```bash
vercel deploy
```

Set the `metadataBase` in `app/layout.tsx` once a real domain is wired.

## Design source

Full design references live alongside this project at:

```
..\useknockout-web-app\design_handoff_useknockout\
  README.md                  ← source of truth (re-read for any decision)
  brand/                     ← tokens + brand system
  ui_kits/marketing/         ← homepage HTML/JSX prototypes
  ui_kits/docs/              ← docs prototypes
  ui_kits/playground/        ← playground prototype
  ui_kits/errors/            ← error pages
  assets/                    ← logos, OG, banner, examples
  fonts/                     ← Inter TTFs
```

Treat the prototypes as visual source of truth. If this implementation drifts, prefer the handoff.
