'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchSectors } from '@/lib/sectors';
import type { Holding, Quote, SectorInfo } from '@/lib/types';
import { cur, REDACTED } from '@/lib/format';
import { usePrivacy } from '@/store/theme';

const SECTOR_COLOR: Record<string, string> = {
  'Technology': '#0a84ff',
  'Communication Services': '#bf5af2',
  'Consumer Discretionary': '#ff9f0a',
  'Consumer Staples': '#ffd60a',
  'Financial Services': '#30d158',
  'Healthcare': '#ff453a',
  'Industrials': '#64d2ff',
  'Energy': '#d97757',
  'Materials': '#a384c7',
  'Real Estate': '#5ac8fa',
  'Utilities': '#6ac4dc',
  'Other': '#7e8a99',
};

export function SectorBreakdown({
  holdings, quotes,
}: { holdings: Holding[]; quotes: Record<string, Quote> }) {
  const [hidden] = usePrivacy();
  const [sectors, setSectors] = useState<Record<string, SectorInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tickers = holdings.map((h) => h.ticker);
      if (!tickers.length) { setLoading(false); return; }
      const map = await fetchSectors(tickers);
      if (!cancelled) { setSectors(map); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [holdings]);

  const rows = useMemo(() => {
    const byBucket = new Map<string, { value: number; tickers: string[] }>();
    for (const h of holdings) {
      const q = quotes[h.ticker];
      const value = q && h.shares ? q.price * h.shares : 0;
      if (value === 0) continue;
      const bucket = sectors[h.ticker]?.sector ?? 'Other';
      const existing = byBucket.get(bucket) ?? { value: 0, tickers: [] };
      existing.value += value;
      existing.tickers.push(h.ticker);
      byBucket.set(bucket, existing);
    }
    const total = Array.from(byBucket.values()).reduce((s, b) => s + b.value, 0) || 1;
    return Array.from(byBucket.entries())
      .map(([sector, { value, tickers }]) => ({
        sector, value, tickers,
        pct: (value / total) * 100,
        color: SECTOR_COLOR[sector] ?? SECTOR_COLOR.Other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, quotes, sectors]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--text-muted)] text-sm">
        Loading sector data…
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-[var(--text-muted)] text-sm">
        Sector breakdown unavailable.
      </div>
    );
  }

  return (
    <div>
      <div className="h-56">
        <ResponsiveContainer>
          <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="sector"
              width={130}
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p: any = payload[0].payload;
                return (
                  <div className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs shadow">
                    <div className="font-semibold text-[var(--text)]">{p.sector}</div>
                    <div className="text-[var(--text-secondary)]">
                      {hidden ? REDACTED : `$${cur(p.value)}`}
                      <span className="ml-2 text-[var(--text-muted)]">{p.pct.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 text-[var(--text-muted)] text-[10px]">
                      {p.tickers.join(', ')}
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {rows.map((r) => (
                <Cell key={r.sector} fill={r.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* numeric breakdown beneath */}
      <div className="mt-3 grid grid-cols-1 gap-1">
        {rows.map((r) => (
          <div key={r.sector} className="flex items-center text-xs">
            <span className="inline-block w-3 h-3 rounded-sm mr-2 shrink-0" style={{ backgroundColor: r.color }} />
            <span className="text-[var(--text)] font-medium">{r.sector}</span>
            <span className="text-[var(--text-muted)] ml-2 truncate">· {r.tickers.join(', ')}</span>
            <span className="flex-1" />
            <span className="text-[var(--text)] font-semibold tabular-nums">
              {hidden ? REDACTED : `$${cur(r.value)}`}
            </span>
            <span className="text-[var(--text-muted)] ml-3 w-14 text-right tabular-nums">
              {r.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
