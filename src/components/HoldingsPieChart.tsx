'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Holding, Quote } from '@/lib/types';
import { cur, REDACTED } from '@/lib/format';
import { usePrivacy } from '@/store/theme';

// A diverse, color-blind-friendly palette that reads on both light + dark backgrounds.
const PALETTE = [
  '#0a84ff', '#30d158', '#ff9f0a', '#ff453a', '#bf5af2', '#64d2ff',
  '#ffd60a', '#ff375f', '#5ac8fa', '#a384c7', '#6ac4dc', '#d97757',
  '#7e8a99',
];

type Props = {
  holdings: Holding[];
  quotes: Record<string, Quote>;
};

export function HoldingsPieChart({ holdings, quotes }: Props) {
  const [hidden] = usePrivacy();

  const data = useMemo(() => {
    const rows = holdings
      .map((h) => {
        const q = quotes[h.ticker];
        const value = q && h.shares ? q.price * h.shares : 0;
        return { ticker: h.ticker, name: h.name ?? q?.name ?? h.ticker, value };
      })
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value);
    const total = rows.reduce((sum, r) => sum + r.value, 0) || 1;
    return rows.map((r) => ({ ...r, pct: (r.value / total) * 100 }));
  }, [holdings, quotes]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-muted)] text-sm">
        Add holdings with share counts to see the breakdown.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] gap-6">
      <div className="h-72">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="ticker"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={1.5}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p: any = payload[0].payload;
                return (
                  <div className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs shadow">
                    <div className="font-bold text-[var(--text)]">{p.ticker}</div>
                    <div className="text-[var(--text-secondary)] text-[11px]">{p.name}</div>
                    <div className="mt-1 text-[var(--text)]">
                      {hidden ? REDACTED : `$${cur(p.value)}`}
                      <span className="ml-2 text-[var(--text-muted)]">
                        {p.pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* legend table */}
      <div className="overflow-y-auto max-h-72">
        <table className="w-full text-sm">
          <tbody>
            {data.map((row, i) => (
              <tr key={row.ticker} className="border-b border-[var(--border)] last:border-b-0">
                <td className="py-2 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="font-semibold text-[var(--text)]">{row.ticker}</span>
                  </div>
                </td>
                <td className="text-[var(--text-secondary)] py-2 pr-2 text-xs truncate max-w-[140px]">
                  {row.name}
                </td>
                <td className="text-right text-[var(--text)] py-2 pr-2">
                  {hidden ? REDACTED : `$${cur(row.value)}`}
                </td>
                <td className="text-right text-[var(--text-muted)] py-2 text-xs">
                  {row.pct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
