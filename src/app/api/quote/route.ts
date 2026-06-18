// Server-side proxy for Finnhub /quote.
// We use Finnhub instead of Yahoo for quotes because Yahoo's /v8 endpoint
// has been aggressively rate-limiting unauthenticated server-side IPs.
// Finnhub free tier: 60 req/min, generous daily cap.
//
// Cache for 20 seconds so navigating between pages doesn't burn quota.

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker');
  if (!ticker) {
    return NextResponse.json({ error: 'missing ticker' }, { status: 400 });
  }

  const key = process.env.FINNHUB_KEY;
  if (!key) {
    return NextResponse.json({ error: 'FINNHUB_KEY missing' }, { status: 500 });
  }

  const sym = ticker.toUpperCase();

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`;
    const upstream = await fetch(url, { next: { revalidate: 20 } });
    if (!upstream.ok) {
      return NextResponse.json({ error: 'upstream', status: upstream.status }, { status: 502 });
    }
    const d = await upstream.json();
    // d.c=current, d.d=change abs, d.dp=change %, d.pc=prev close
    // Finnhub returns all zeros when symbol is invalid; treat that as no-data.
    if (!d || (d.c === 0 && d.pc === 0)) {
      return NextResponse.json({ error: 'no-data' }, { status: 404 });
    }
    return NextResponse.json({
      ticker: sym,
      price: Number(d.c ?? 0),
      change: Number(d.d ?? 0),
      change_pct: Number(d.dp ?? 0),
      prev_close: Number(d.pc ?? 0),
      currency: 'USD',
    }, {
      headers: { 'Cache-Control': 'public, max-age=20, s-maxage=20' },
    });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
}
