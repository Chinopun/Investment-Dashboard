// Server-side proxy for Yahoo Finance.
// Yahoo doesn't send CORS headers, so the browser can't hit it directly.
// We hit query1, falling back to query2, with a real-browser UA.

import { NextRequest, NextResponse } from 'next/server';

const HOSTS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com',
];

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json',
};

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path');
  if (!path || !path.startsWith('/')) {
    return NextResponse.json({ error: 'missing or invalid path' }, { status: 400 });
  }

  for (const host of HOSTS) {
    try {
      const upstream = await fetch(host + path, { headers, cache: 'no-store' });
      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json(data, {
          headers: { 'Cache-Control': 'public, max-age=15, s-maxage=15' },
        });
      }
    } catch { /* try next host */ }
  }
  return NextResponse.json({ error: 'upstream failed' }, { status: 502 });
}
