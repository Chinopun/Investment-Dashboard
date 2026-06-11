# Investment Dashboard (Web)

A web companion to the [Investment Information iOS app](https://github.com/Chinopun/investment-app). Same Supabase backend, browser-accessible UI, plus a Dashboard view with a holdings pie chart and a sector breakdown.

## Pages

| Route | What it shows |
|---|---|
| `/` | **Dashboard** — summary cards, holdings pie chart, sector breakdown, today's movers, link to today's digest |
| `/portfolio` | Sortable table of every holding with today and all-time gain/loss |
| `/stock/[ticker]` | Stock detail: 5-range chart (1d/5d/1mo/6mo/1y) with % per range, sector chip, recent news |
| `/news` | Combined news feed from all sources |
| `/digests` | Archive of every morning digest |
| `/digests/[date]` | Full markdown rendering of one day's digest |
| `/settings` | Theme (Light / Dark / Auto), privacy toggle, notify time + time zone |

## Tech

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** with CSS-variable theme tokens
- **Recharts** for the pie chart, sector bar chart, and stock chart
- **Supabase** client (reuses the iOS app's database)
- **Finnhub** server-side proxy for sector lookup (key stays off the client)
- **Yahoo Finance** server-side proxy for quotes + candles (avoids CORS, no key needed)

## Local development

```bash
cd "Investment Information Website"
npm install
cp .env.example .env.local
# Fill in the values from your iOS app's environment + Finnhub key
npm run dev
```

Then open http://localhost:3000.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=https://mkubdyjyzmneksouulrg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # safe to expose; gated by RLS
NEXT_PUBLIC_USER_EMAIL=chinopun2008@gmail.com

FINNHUB_KEY=xxxxxxxx                   # server-only; never exposed to browser
```

The Supabase URL + anon key are the **same values** already in `investment-app/.env`.

## Deploy to Vercel (free, ~3 minutes)

1. Push this folder to its own GitHub repo (instructions below if you haven't already).
2. Go to https://vercel.com → **Add New → Project** → **Import** your repo.
3. Framework preset is auto-detected as **Next.js**. Leave the defaults.
4. **Environment Variables** → add the four from the section above. Click **Deploy**.
5. ~90 seconds later you'll get a `https://<your-project>.vercel.app` URL. Open it on your phone, your laptop, anywhere.

After the first deploy, every `git push` to `main` auto-redeploys.

### Optional: protect the site with a password

The dashboard is otherwise publicly reachable. The cheap way to keep it private:

- **Vercel preview deployments** are gated by Vercel login by default — only you can see them. If you set `vercel deploy` (no `--prod`), the URL is preview-only and requires your Vercel account.
- For production: paid Vercel Pro ($20/month) has password protection, or you can add a custom middleware (see Next.js Middleware docs) using `DASHBOARD_PASSWORD` in your env vars.

For a personal app no one's looking for, the URL being publicly reachable but not advertised is usually fine — the Supabase data is gated by RLS to a known user-email lookup.

## Push to GitHub

```bash
cd "Investment Information Website"
git init -b main
git add .
git commit -m "Initial commit: investment dashboard web app"
gh repo create investment-dashboard --private --source=. --push
```

That'll create `github.com/Chinopun/investment-dashboard` (private) and push.

## How the data flows

```
       Browser
         |
   ┌─────┴─────────┐
   |               |
  /api/yahoo    /api/sector       (Next.js server routes)
   |               |
   v               v
 Yahoo            Finnhub
 Finance          (FINNHUB_KEY)
   |
   v
 quote+candles
                                  Browser also queries Supabase JS
                                  client directly (anon key, RLS):
                                    - holdings
                                    - news_articles
                                    - daily_digests
                                    - users
```

The website is **read-mostly**. You add / edit / remove holdings from the iOS app or via the Supabase Dashboard SQL Editor. The website renders whatever is in the DB.

## Caveats / "wontfix" for v1

- No "add holding" form on the website — kept the iOS app as the single source of truth for portfolio edits. Trivial to add later: copy the table-search + insert logic from the iOS modal.
- Yahoo's `/v8/finance/chart` is unofficial. If it ever stops working, swap the `/api/yahoo` proxy for Finnhub `/quote` + `/stock/candle` (Finnhub's free tier covers candles).
- The sector lookup uses Finnhub's `finnhubIndustry` field, then collapses it into a coarse 11-bucket palette in `src/lib/sectors.ts`. If a ticker comes back with no industry, it's bucketed as "Other".

## Folder layout

```
Investment Information Website/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── yahoo/route.ts        # server proxy for Yahoo quotes/candles
│   │   │   └── sector/route.ts       # server proxy for Finnhub
│   │   ├── stock/[ticker]/page.tsx
│   │   ├── digests/page.tsx
│   │   ├── digests/[date]/page.tsx
│   │   ├── portfolio/page.tsx
│   │   ├── news/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── page.tsx                  # Dashboard
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/                   # SummaryCards, HoldingsPieChart, SectorBreakdown, NewsList, StockChart, Sidebar, ThemeProvider, PageHeader
│   ├── lib/                          # supabase, prices, sectors, format, usePortfolio, types
│   └── store/                        # theme + privacy stores
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```
