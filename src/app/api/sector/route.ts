// Server-side proxy for Finnhub /stock/profile2 (keeps FINNHUB_KEY off client).
// Cached for an hour at the edge — sectors basically never change.

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker');
  if (!ticker) return NextResponse.json({ error: 'missing ticker' }, { status: 400 });

  const key = process.env.FINNHUB_KEY;
  if (!key) return NextResponse.json({ error: 'FINNHUB_KEY missing' }, { status: 500 });

  try {
    const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${key}`;
    const upstream = await fetch(url, { next: { revalidate: 3600 } });
    if (!upstream.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 });
    const data = await upstream.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
    });
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
}
