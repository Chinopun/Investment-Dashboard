// Yahoo Finance /v8/finance/chart via our own /api/yahoo proxy.
// Why a proxy: Yahoo doesn't send CORS headers, so direct fetches from the
// browser fail. The /api route runs on the server (Node), where CORS doesn't
// apply.

import type { Quote, ChartData } from './types';

async function getJson(path: string): Promise<any> {
  const res = await fetch(`/api/yahoo?path=${encodeURIComponent(path)}`);
  if (!res.ok) return null;
  return res.json();
}

// Quotes come from Finnhub via our own /api/quote route.
// We moved off Yahoo because their server-side endpoints aggressively 429
// any IP making more than a few requests in a row.
export async function fetchQuotes(tickers: string[]): Promise<Quote[]> {
  if (tickers.length === 0) return [];
  const results = await Promise.all(
    tickers.map(async (t): Promise<Quote | null> => {
      const sym = t.toUpperCase();
      try {
        const res = await fetch(`/api/quote?ticker=${encodeURIComponent(sym)}`);
        if (!res.ok) return null;
        const data = await res.json();
        return {
          ticker: sym,
          price: Number(data.price ?? 0),
          change: Number(data.change ?? 0),
          change_pct: Number(data.change_pct ?? 0),
          prev_close: Number(data.prev_close ?? 0),
          currency: data.currency ?? 'USD',
          // Finnhub /quote doesn't return company name; PortfolioRow already
          // falls back to holding.name from Supabase, so no extra lookup needed.
        };
      } catch {
        return null;
      }
    }),
  );
  return results.filter((q): q is Quote => q !== null);
}

export async function fetchChart(
  ticker: string,
  range: '1d' | '5d' | '1mo' | '6mo' | '1y' = '1d',
): Promise<ChartData> {
  const interval =
    range === '1d' ? '5m' :
    range === '5d' ? '30m' :
    range === '1mo' ? '1d' :
    range === '6mo' ? '1d' :
    '1wk';
  const json = await getJson(
    `/v8/finance/chart/${encodeURIComponent(ticker.toUpperCase())}?range=${range}&interval=${interval}`,
  );
  const result = json?.chart?.result?.[0];
  if (!result) return { candles: [], changePct: null, changeAbs: null };

  const ts: number[] = result.timestamp ?? [];
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
  const candles = ts
    .map((t, i) => ({ t, close: closes[i] ?? NaN }))
    .filter((c) => Number.isFinite(c.close));

  const meta = result.meta ?? {};
  const currentPrice = Number(meta.regularMarketPrice ?? candles[candles.length - 1]?.close ?? 0);
  const startPrice = Number(meta.chartPreviousClose ?? candles[0]?.close ?? 0);

  let changePct: number | null = null;
  let changeAbs: number | null = null;
  if (startPrice > 0 && currentPrice > 0) {
    changeAbs = currentPrice - startPrice;
    changePct = (changeAbs / startPrice) * 100;
  }
  return { candles, changePct, changeAbs };
}

export type TickerSearchHit = {
  symbol: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
};

export async function searchTicker(q: string): Promise<TickerSearchHit[]> {
  const query = q.trim();
  if (!query) return [];
  const json = await getJson(`/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`);
  if (!json) return [];
  return (json?.quotes ?? []).filter(
    (item: any) => item.symbol && item.quoteType === 'EQUITY',
  );
}
