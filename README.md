# Risen Dust — Websites, Business Apps & AI Automation

A client-facing portfolio for small businesses looking for:

- Professional websites
- Custom business applications
- Automated lead capture and follow-up
- Automated customer messaging
- CRM optimization

The site presents websites, applications, and product ideas as proof of work, including:

- TV Install Chicago
- Jojin's Kitty Thrift Shop
- John's Masonry & Roofing
- Ravens Girls Wrestling
- Lead Trade Zone
- Blade Wipes
- Arma Sancta (`https://risendust.pages.dev/`)
- HomeTeam
- ClipTap (`https://cliptap.us/`)

## How it works

The project cards contain scaled, non-interactive views of each live homepage.
Selecting a card opens the corresponding website in a new tab.

## Deploy

Cloudflare Pages project **`portfolio`** (git-connected), serving
`risendust.com` and `www.risendust.com`. It deploys on push to `main`.

**No build step runs — Pages serves the repository root verbatim.** Verified in
production: `assets/styles.css?v=…` reaches the browser unhashed, and
`/package.json` and `/README.md` are publicly readable. So:

- Anything that must be served has to live at the repo **root**, not in
  `public/` — a `public/` directory is served as a literal `/public/` path,
  which is why the duplicate robots/sitemap copies there were removed.
- `404.html` at the root is what Pages serves, with a real 404 status, for
  unmatched paths. Without it every bogus URL returned the homepage at
  HTTP 200 — a soft 404 on infinite URLs.
- Vite remains in `devDependencies` for `npm run dev` only. Do not assume
  `npm run build`/`dist` is in the deploy path; it is not.

For local development, run `npm install` followed by `npm run dev`.
