// Sector lookup via the /api/sector route (which calls Finnhub server-side
// so the API key stays off the client).
//
// Finnhub returns a fine-grained "finnhubIndustry" — we collapse those into a
// small coarse set so the dashboard's sector breakdown chart is readable.

import type { SectorInfo } from './types';

// Coarse buckets the dashboard's pie chart uses.
export const SECTORS = [
  'Technology',
  'Communication Services',
  'Consumer Discretionary',
  'Consumer Staples',
  'Financial Services',
  'Healthcare',
  'Industrials',
  'Energy',
  'Materials',
  'Real Estate',
  'Utilities',
  'Other',
] as const;
export type Sector = typeof SECTORS[number];

// Finnhub industry → coarse sector mapping.
export function bucketSector(finnhubIndustry?: string): Sector {
  if (!finnhubIndustry) return 'Other';
  const v = finnhubIndustry.toLowerCase();

  if (/(semiconductor|software|hardware|technology|electronic|computer|cloud|saas)/.test(v)) return 'Technology';
  if (/(media|telecom|internet content|entertainment|interactive|publishing|broadcast)/.test(v)) return 'Communication Services';
  if (/(retail|automobile|leisure|apparel|hotel|restaurant|luxury|consumer durable|gambling|specialty)/.test(v)) return 'Consumer Discretionary';
  if (/(beverage|food|tobacco|household|personal product|grocery|staple)/.test(v)) return 'Consumer Staples';
  if (/(bank|insurance|finance|capital market|asset management|broker|exchange|reit financial)/.test(v)) return 'Financial Services';
  if (/(pharma|biotech|health|medical|hospital|life science)/.test(v)) return 'Healthcare';
  if (/(industrial|aerospace|airline|machinery|defense|transportation|construction|engineering|professional)/.test(v)) return 'Industrials';
  if (/(oil|gas|energy|petroleum|coal|renewable energy|solar)/.test(v)) return 'Energy';
  if (/(chemical|metal|mining|paper|forest|material|steel|gold)/.test(v)) return 'Materials';
  if (/(real estate|reit|property)/.test(v)) return 'Real Estate';
  if (/(utility|electric|water|gas distribution)/.test(v)) return 'Utilities';
  return 'Other';
}

// In-memory cache so multiple components on the same page don't refetch.
const cache = new Map<string, SectorInfo>();

export async function fetchSector(ticker: string): Promise<SectorInfo | null> {
  const sym = ticker.toUpperCase();
  if (cache.has(sym)) return cache.get(sym)!;

  try {
    const res = await fetch(`/api/sector?ticker=${encodeURIComponent(sym)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.error) return null;
    const info: SectorInfo = {
      ticker: sym,
      industry: data.finnhubIndustry ?? '',
      sector: bucketSector(data.finnhubIndustry),
      marketCap: data.marketCapitalization,
      weburl: data.weburl,
    };
    cache.set(sym, info);
    return info;
  } catch {
    return null;
  }
}

export async function fetchSectors(tickers: string[]): Promise<Record<string, SectorInfo>> {
  const out: Record<string, SectorInfo> = {};
  const results = await Promise.all(tickers.map((t) => fetchSector(t)));
  for (const r of results) if (r) out[r.ticker] = r;
  return out;
}
