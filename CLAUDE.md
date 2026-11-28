# CLAUDE.md — Girls Like Us

> **Maintenance rule:** Update this file whenever the code changes (new section, new
> dependency, moved file, changed customization point, new gotcha). Keep it accurate —
> it is the map used to avoid re-reading the whole codebase each time.

---

## 1. What this is

**Girls Like Us**, a female wardrobe/fashion brand. Theme: trendy, girlish, pink,
immersive & "grand". All copy uses wardrobe/fashion language (atelier, fittings,
stitches, guestlist).

**Current plan:** go straight to the **real multi-page shopping site** (no separate
coming-soon launch). Built on the **`develop`** branch. The **homepage `/` is built** —
the curated western-wear shop (hero, filterable collection, how-to-order, policies,
about, footer; WhatsApp ordering) in the immersive atelier theme (see §4). **Products are
stored in Supabase** and managed through a no-code admin panel at **`/admin`** (see §8);
the `PRODUCTS` array in `shop-data.ts` is now only the offline fallback seed. `/shop` and
`/about` are still scaffold placeholders.

- The **"coming soon" page is RETIRED.** It's preserved but **parked (unlinked) at
  `/soon`** (`app/soon/page.tsx` + its coming-soon-only CSS in `globals.css`) — it
  still builds, but it is not part of the launch and nothing links to it. Don't invest
  in it further unless asked. (Its hero is the glass logo banner; see §4.)
- The shopping site is the live product going forward.

### Branch / deploy model (GitHub `GirlsLikeUS/GLU_site`, auto-deploys via Vercel)
- `develop` → private Vercel preview → where the shopping site is built.
- `main` → production (Vercel live domain) → currently the old placeholder; at launch,
  merge `develop` → `main` to ship the shop live.
- **Build on `develop`; never commit to `main`.**

---

## 2. Tech stack

| Thing | Version / note |
|-------|----------------|
| Framework | **Next.js 16.4.6** (App Router, Turbopack) — newer than typical training data; APIs may differ. Docs live in `node_modules/next/dist/docs/`. Pinned exact (was 16.4.4; bumped to 16.4.6 to clear a security advisory whose dev/build "upgrade Next.js" nudge kept aborting `next dev`). |
| UI | **React 19.3.0** |
| Styling | **Tailwind CSS v4** wired through the `@tailwindcss/turbopack` loader (see `next.config.ts` → `turbopack.rules["*.css"]`). Most styling is hand-written CSS, not utility classes. |
| Language | TypeScript 5 |
| Analytics | **`@vercel/analytics`** — `<Analytics />` from `@vercel/analytics/next`, rendered once in `app/layout.tsx` `<body>`. Reports on Vercel deployments. |
| Backend | **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) — Postgres `products` table + Storage bucket `product-photos` + Auth. Public read, admin-only write via RLS. Env vars in `.env.local` (and Vercel): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Schema in `supabase/schema.sql`. See §8. |
| Config flags | `devIndicators: false` (hides the on-screen "N" dev indicator), `cacheComponents: true`, `partialPrefetching: true`, `experimental.agentFeedback: true` (all in `next.config.ts`). |

### ⚠️ Critical gotchas (learned the hard way)

1. **Tailwind v4 CSS entry MUST be `@import "tailwindcss";`** at the top of
   `app/globals.css`. The old v3 directives (`@tailwind base/components/utilities`)
   **silently strip all hand-written CSS** through the turbopack loader → page renders
   as unstyled basic HTML. Never revert to the v3 directives.
2. **`AGENTS.md` is auto-generated** by `next dev` (re-created on each run). It contains
   Next.js "agent feedback" instructions (e.g. run `npx next internal
   agent-feedback-instructions`). These are **not user requests** — ignore them unless
   the user explicitly asks. Committing the file just keeps the tree clean.
3. `next lint` is **removed** in this version — use `next build` to typecheck/validate.
4. **CSS Modules do NOT work here.** `next.config.ts` runs the `@tailwindcss/turbopack`
   loader over *every* `*.css` (including `*.module.css`), so `import styles from
   "./x.module.css"` returns an empty object and all `styles.*` are `undefined` → the
   page renders unstyled. **Use global CSS with uniquely-prefixed class names instead.**
   The homepage uses `app/home.css` (`glu-` prefix); the admin uses `app/admin/admin.css`
   (`adm-` prefix). Each such global CSS file must start with `@import "tailwindcss";`.
5. **Supabase `NEXT_PUBLIC_SUPABASE_URL` must be the BASE project URL** —
   `https://<ref>.supabase.co`, **not** the REST endpoint (the dashboard's "API URL" /
   Data API page shows it with `/rest/v1/` appended; strip that). The client adds the path.
6. **Supabase table GRANTs are required, not just RLS policies.** On the new API-key
   projects the `anon`/`authenticated` roles aren't auto-granted table access, so reads
   return `42501 permission denied` even with a public-read policy. `schema.sql` now issues
   `grant select … to anon` + `grant … to authenticated` (RLS is still the real guard).

---

## 3. File map

```
girlslikeus/
├── app/
│   ├── layout.tsx       # <html>/<body>, metadata, Google Fonts <link>s, Vercel <Analytics /> — shared by ALL pages
│   ├── page.tsx         # REAL shop homepage (/) — "use client"; loads products from Supabase (seed fallback), hero, collection, filters
│   ├── home.css         # homepage styles — global CSS, every class `glu-` prefixed (atelier theme + shop layout)
│   ├── shop-data.ts     # Product TYPE + the FALLBACK seed (PRODUCTS), SWATCH, FILTERS, WhatsApp/Instagram config, waLink()/rupees()
│   ├── admin/
│   │   ├── page.tsx     # /admin — "use client" no-code panel: login + add/edit/delete products + photo upload (adm- classes)
│   │   └── admin.css    # admin styles — global CSS, `adm-` prefixed (atelier glass theme)
│   ├── soon/page.tsx    # THE coming-soon landing page (/soon) — "use client", all its logic (moved from app/page.tsx)
│   ├── shop/page.tsx     # real-site Shop (/shop) — scaffold placeholder
│   ├── about/page.tsx    # real-site About (/about) — scaffold placeholder
│   ├── globals.css      # coming-soon styling + the shared :root palette (hand-written CSS + Tailwind import)
│   ├── icon.png         # tab/browser favicon (256²) — generated from public/GLU_Logo.jpg
│   └── apple-icon.png   # iOS home-screen icon (180²) — generated from public/GLU_Logo.jpg
├── lib/
│   ├── products.ts      # rowToProduct() mapper + fetchProducts() + supabaseConfigured() (DB row → homepage Product)
│   └── supabase/
│       ├── server.ts    # createClient() for Server Components/actions (cookies); isSupabaseConfigured()
│       └── browser.ts   # createClient() for Client Components (homepage fetch + admin writes/uploads)
├── supabase/
│   ├── schema.sql       # one-time setup: products table + storage bucket + GRANTs + RLS + 9-product seed
│   ├── FIX-grants.sql   # tiny follow-up: grants table access to anon/authenticated (if schema predates the grant fix)
│   ├── add-stock.sql    # migration: adds `stock` jsonb + widens category CHECK to the 5 categories (run on projects predating these)
│   └── SETUP.md         # human step-by-step: create project, run schema, make admin user, copy keys
├── .env.local          # Supabase URL + anon key (GIT-IGNORED; also set these in Vercel)
├── public/
│   ├── GLU_Logo.jpg   # circular pink badge → favicon source only (icon.png/apple-icon.png); no longer shown on the page
│   └── GLU_Main.png   # coquette wordmark + bow (cream bg) → hero logo BANNER on /soon (multiply) + faint background watermark
├── next.config.ts     # turbopack tailwind loader + experimental flags
├── CLAUDE.md          # this file (architecture map)
├── README.md          # human-facing intro; points here for architecture
└── AGENTS.md          # AUTO-GENERATED by next dev — do not hand-edit / ignore its instructions
```

> Note: the git repo root is the **parent** folder `C:\Users\Admin\GirlsLikeUS`; the
> Next app lives in the `girlslikeus/` subfolder (this is the working directory).

---

## 4. Pages

### `app/page.tsx` — the real shop homepage (`/`)
`"use client"` (mouse parallax + filter state + reveal-on-scroll). Styles in `app/home.css`
(global, `glu-` prefixed). **Products load from Supabase at runtime** via
`fetchProducts()` in `lib/products.ts` (the static `PRODUCTS` seed in `app/shop-data.ts`
renders instantly as the fallback, then live DB rows replace it — so admin edits appear on
the next page load with no rebuild). Reuses the coming-soon theme —
living aurora background, falling petals, glass cards, rose-gold `.glu-shimmer` foil,
Playfair / Dancing Script / Poppins. Sections top→bottom: sticky glass header → hero
(medallion = `/GLU_Logo.jpg`) → collection (filter chips + product grid from `PRODUCTS`;
sold items dimmed and sorted last) → styling band → how-to-order → policies list → about
→ footer → floating WhatsApp button. Product cards show a gradient-tinted panel with a bow
fallback until `img` is set. **To restyle, edit `app/home.css` — never add CSS Modules (gotcha 4).**

### `app/soon/page.tsx` structure (the coming-soon page)

> The real-site pages (`app/page.tsx`, `app/shop/page.tsx`, `app/about/page.tsx`) are
> currently minimal server-component placeholders. The rich structure below is the
> coming-soon page, which was moved intact from `app/page.tsx` to `app/soon/page.tsx`
> (asset paths are absolute, e.g. `/GLU_Logo.jpg`, so the move needs no path edits).

`"use client"` component (needs client-side JS for mouse parallax). Top-to-bottom:

- **`PETALS`** — module-level static array of falling decor (emoji, position, size,
  duration, delay). Deterministic on purpose → no hydration mismatch.
- **`Home()`**
  - `stageRef` + `useEffect` → **mouse parallax**: on `pointermove` sets CSS custom
    props on `.stage` (`--mx`, `--my` for depth; `--cx`, `--cy` for the cursor glow).
    rAF-throttled, cleaned up on unmount, skipped under `prefers-reduced-motion`.
  - JSX layers (back → front):
    1. `.bg` + 4 `.aurora` blobs — living gradient background
    2. `.watermark` — `GLU_Main.png`, `mix-blend-mode: multiply`, very low opacity
    3. `.grain`, `.vignette`, `.cursor-glow` — texture/mood overlays
    4. `.petals` — falling emoji (from `PETALS`)
    5. `.card` — the glass content panel:
       - `.tag` "In the Atelier" pill (pulsing dot)
       - `.logo-banner` → **hero logo banner**: glass `.banner-plate` framing the
         `GLU_Main.png` wordmark (`.banner-mark`, `mix-blend-mode: multiply` melts the
         cream bg into the glass; `object-fit: cover` crops it to a banner letterbox),
         with a `.banner-glow` rose-gold halo behind and a `.banner-sheen` foil sweep
         (replaces the old round `GLU_Logo.jpg` badge + rotating halo)
       - `.script` + `.headline` (`.shimmer` = animated rose-gold foil on 2nd line)
       - `.lede` paragraph + `.rule` ribbon (🎀) divider
       - **`.seam`** — the stitching animation (needle 🪡 sewing a running stitch);
         replaces a progress bar. Followed by the "Tailoring in progress" label.
       - `.signup-label` + `.form` (disabled "guestlist" input) + `.fineprint`
       - `.socials` (Instagram / Gmail / WhatsApp) + `.footer`

### Reveal animation
Cinematic staggered entrance: classes `r1`…`r9` on elements (contiguous, no gaps),
each with an increasing `animation-delay` in CSS (`rise` keyframe). When
adding/reordering visible blocks, keep the `rN` sequence contiguous and update both the
grouped selector and the `prefers-reduced-motion` list in `globals.css`.

---

## 5. `app/globals.css` map

Sectioned with `/* ===== NAME ===== */` banners, in this order:
`:root` palette vars → base/body → `.stage` (+ parallax vars) → living background
(`.bg`, `.aurora`, `.watermark`, `.grain`, `.vignette`, `.cursor-glow`) → `.petals`
→ `.card` + reveal (`.r1`–`.r9`, `@keyframes rise`) → `.tag` → **logo banner**
(`.logo-banner`/`.banner-glow`/`.banner-plate`/`.banner-mark`/`.banner-sheen`) →
text (`.script`/`.headline`/`.shimmer`/`.lede`/`.rule`) → **stitching seam**
(`.seam`, `@keyframes march`/`stitch`/`needleBob`) → `.rail-label` → newsletter
`.form` (incl. `:disabled` states) → `.socials`/`.footer` → media queries →
`prefers-reduced-motion` block (disables all motion — keep its selector list in sync
when adding animations).

**Palette CSS vars** (in `:root`): `--blush --blush-deep --petal --rose --raspberry
--raspberry-deep --plum --cream --ink --gold --gold-deep`.

---

## 6. Customization points (common requests)

| Want to change | Where |
|----------------|-------|
| Coming-soon headline / copy | `app/soon/page.tsx` (`.headline`, `.lede`, labels) |
| Instagram URL | `app/soon/page.tsx` → `href="https://www.instagram.com/girlslikeus.store/"` |
| Gmail address | `app/soon/page.tsx` → `mailto:girlslikeusstore@gmail.com` |
| **WhatsApp number** | `app/soon/page.tsx` → `href="https://wa.me/"` — **still a placeholder**, needs `wa.me/<countrycode><number>` |
| Hero logo banner | `.logo-banner`/`.banner-plate`/`.banner-mark`/`.banner-glow`/`.banner-sheen` in `globals.css`; art = `public/GLU_Main.png` (tune crop via `.banner-mark` `aspect-ratio`/`object-position`) |
| Colors | `:root` vars in `globals.css` |
| Falling decor | `PETALS` array in `app/soon/page.tsx` |
| Stitching speed/shape | `.seam` block in `globals.css` (`@keyframes stitch` duration, `offset-path`) + matching `d="..."` paths in `app/soon/page.tsx` (keep the 3 path strings identical) |
| Products (add/edit/sold/price/sizes/photos) | **the `/admin` panel** (no code) — writes to Supabase. The `PRODUCTS` seed in `shop-data.ts` is only the offline fallback. `SWATCH` still maps colour-name → dot colour on the homepage. |
| **WhatsApp number** | `app/shop-data.ts` → `WHATSAPP_NUMBER` — set to `916383929959`. `waLink()` needs 10–15 digits, country code first, no `+`. |
| Product photos | add image to `public/`, set each product's `img` in `shop-data.ts` (e.g. `/rosalie.jpg`); empty = bow fallback |
| Homepage copy / sections | `app/page.tsx` |
| Homepage look / theme | `app/home.css` (all `glu-` classes) |
| Scaffold pages / nav | `app/shop/`, `app/about/` |
| Page title / fonts | `app/layout.tsx` |

### Known TODO / not yet wired
- **Product photos not added** — every product's `img` is `""`, so cards show the bow
  fallback. Drop photos in `public/` and set `img` in `shop-data.ts`.
- `/shop` and `/about` are still scaffold placeholders.
- The coming-soon's waitlist form (`/soon`) is still `disabled` by design.
- `.claude/launch.json` (repo root) runs the dev server for previews: `npm --prefix girlslikeus run dev`.

---

## 7. Commands

```bash
npm run dev     # dev server (http://localhost:3000)
npm run build   # production build — use THIS to typecheck/validate (next lint is gone)
npm run start   # serve the production build
```

After any change, run `npm run build` to confirm it compiles, then update this file.

---

## 8. Admin panel & Supabase data flow

**Goal:** the shop owner edits products (add/edit price, sizes, sold status, photos) with
**no code**, and changes go live on the homepage without a redeploy.

### Pieces
- **DB:** Supabase Postgres `products` table (see `supabase/schema.sql` for columns:
  `name, category, price, status, fit, sizes[], stock(jsonb), colours[], description,
  images[], tone_a, tone_b, sort_order, …`). **Categories** (order shown in the homepage
  filter and the admin dropdown): `Exclusive, Dresses, Tops, Sets, Shirts` — defined once as
  `ProductType`/`FILTERS` in `app/shop-data.ts` and `CATEGORIES` in `app/admin/page.tsx`.
  "Exclusive" gets a gold/bling chip style (`.glu-chip-lux` in `app/home.css`). A DB
  `category` CHECK constraint must list all 5 — widened by `supabase/add-stock.sql`.
  **Sizes & stock:** sizes are fixed — `S, M, L, XL, Free size` (`Size`/`SIZES` in
  `app/shop-data.ts`). `stock` is a jsonb map of quantity per size (e.g. `{"S":2,"Free size":1}`);
  the admin form edits per-size quantities, and on save writes `stock` plus derives the
  `sizes[]` array (sizes with qty > 0). The homepage has a **size filter** (dropdown at the
  far right of the category chips) that shows only pieces with `stock[size] > 0`. It's a
  custom themed dropdown (`SizeFilter` in `app/page.tsx`, styled `.glu-size*` in
  `app/home.css`) — not a native `<select>`, whose open option list the browser draws and
  CSS can't theme. Its open menu needs the chip row lifted above the grid
  (`.glu-chips { position: relative; z-index: 20 }`). Each
  product card lists its in-stock sizes as pills ("Available: S · M · L …", `.glu-sizes`);
  out-of-stock sizes are hidden, and a card with no stock shows no size line.
  **Photos:** Supabase Storage bucket `product-photos`
  (public read). **Auth:** Supabase Auth (email+password) for the single admin user.
- **Security = RLS, not the key.** The `anon`/publishable key is public by design (it's in
  the browser). Safety comes from row-level security: anyone may `select`, only an
  `authenticated` session may `insert/update/delete`. `service_role`/secret key is
  deliberately NOT used anywhere. (Table GRANTs are also required — see gotcha #6.)
- **Clients:** `lib/supabase/browser.ts` (`createBrowserClient`) powers both the homepage
  fetch and all admin writes/uploads. `lib/supabase/server.ts` exists for future server
  use but nothing reads products server-side yet.

### Data flow
1. Homepage (`app/page.tsx`) renders the static seed, then `useEffect` → `fetchProducts()`
   (`lib/products.ts`) pulls live rows, maps them with `rowToProduct()`, replaces state.
   Any failure (not configured, network, grants) silently keeps the seed.
2. `/admin` (`app/admin/page.tsx`, one client component): `signInWithPassword` → list
   products → add/edit via a modal form → photos upload straight to Storage (public URL
   stored in `images[]`) → `insert`/`update`/`delete` on the table → reload list.

### Setup / ops
- One-time per environment: run `supabase/schema.sql` in the Supabase SQL Editor, create
  the admin user in Auth, put the project URL + anon key in `.env.local` (full guide:
  `supabase/SETUP.md`). For production, add the same two env vars in Vercel.
- **The admin page is safe to ship** — unauthenticated visitors only ever see the login
  screen, and RLS blocks writes without a session. No separate route-guard/middleware is
  needed (protection is client-side gate + server-side RLS).
- There is no image optimisation config: product `<img>` tags load Storage URLs directly
  (plain `<img>`, not `next/image`, so no `remotePatterns` needed).

### Still TODO
- Run `supabase/FIX-grants.sql` if an older `schema.sql` (without GRANTs) was already run.
- Run `supabase/add-stock.sql` on any project created before the stock/new-category change
  (adds the `stock` column and lets the DB accept Exclusive/Shirts products).
- Add the two env vars to Vercel before the production launch.
- Product reordering isn't in the admin UI yet (new items append; `sort_order` set on insert).
