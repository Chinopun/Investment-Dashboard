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

export async function fetchQuotes(tickers: string[]): Promise<Quote[]> {
  if (tickers.length === 0) return [];
  const results = await Promise.all(
    tickers.map(async (t): Promise<Quote | null> => {
      const sym = t.toUpperCase();
      const json = await getJson(`/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1d`);
      const meta = json?.chart?.result?.[0]?.meta;
      if (!meta) return null;
      const price = Number(meta.regularMarketPrice ?? 0);
      const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? price);
      const change = price - prev;
      const change_pct = prev ? (change / prev) * 100 : 0;
      return {
        ticker: sym,
        price,
        change,
        change_pct,
        prev_close: prev,
        currency: meta.currency ?? 'USD',
        name: meta.longName ?? meta.shortName,
      };
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
