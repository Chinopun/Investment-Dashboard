'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePortfolio } from '@/lib/usePortfolio';
import { PageHeader } from '@/components/PageHeader';
import { SummaryCards } from '@/components/SummaryCards';
import { sign, pct, cur, REDACTED } from '@/lib/format';
import { usePrivacy } from '@/store/theme';

export default function PortfolioPage() {
  const { holdings, quotes, totals, loading } = usePortfolio();
  const [hidden] = usePrivacy();

  // Sort by current position value, desc.
  const rows = useMemo(() => {
    return [...holdings]
      .map((h) => {
        const q = quotes[h.ticker];
        const price = q?.price;
        const value = price != null && h.shares != null ? price * h.shares : 0;
        const dayAbs = q && h.shares != null ? q.change * h.shares : null;
        const allTimeAbs =
          price != null && h.cost_basis != null && h.shares != null
            ? (price - h.cost_basis) * h.shares
            : null;
        const allTimePct =
          price != null && h.cost_basis != null && h.cost_basis > 0
            ? ((price - h.cost_basis) / h.cost_basis) * 100
            : null;
        return { ...h, q, price, value, dayAbs, allTimeAbs, allTimePct };
      })
      .sort((a, b) => {
        if (b.value !== a.value) return b.value - a.value;
        return a.ticker.localeCompare(b.ticker);
      });
  }, [holdings, quotes]);

  return (
    <>
      <PageHeader title="Portfolio" subtitle="All holdings, ranked by current value." />
      <div className="px-6 py-6 space-y-6">
        <SummaryCards totals={totals} />

        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  <Th className="text-left">Ticker</Th>
                  <Th className="text-right">Price</Th>
                  <Th className="text-right">Today</Th>
                  <Th className="text-right">All time</Th>
                  <Th className="text-right">Position value</Th>
                  <Th className="text-right">Shares · Cost</Th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">Loading…</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                    No holdings yet. Add some from the iOS app or via the database.
                  </td></tr>
                )}
                {rows.map((r) => {
                  const dayColor = (r.q?.change_pct ?? 0) >= 0 ? 'text-[var(--pos)]' : 'text-[var(--neg)]';
                  const allColor =
                    r.allTimeAbs == null ? 'text-[var(--text-secondary)]'
                    : r.allTimeAbs >= 0 ? 'text-[var(--pos)]' : 'text-[var(--neg)]';
                  return (
                    <tr
                      key={r.id}
                      className="border-b last:border-b-0 border-[var(--border)] hover:bg-[var(--bg)] transition"
                    >
                      <Td>
                        <Link href={`/stock/${r.ticker}`} className="block">
                          <div className="font-bold text-[var(--text)]">{r.ticker}</div>
                          <div className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">
                            {r.q?.name ?? r.name}
                          </div>
                        </Link>
                      </Td>
                      <Td className="text-right tabular-nums">
                        {r.price != null ? `$${cur(r.price)}` : '—'}
                      </Td>
                      <Td className={`text-right tabular-nums ${dayColor}`}>
                        {r.q?.change_pct != null ? `${sign(r.q.change_pct)}${pct(r.q.change_pct)}%` : '—'}
                        <div className="text-[11px] font-normal mt-0.5">
                          {r.dayAbs == null ? '' : hidden ? REDACTED : `${sign(r.dayAbs)}$${cur(r.dayAbs)}`}
                        </div>
                      </Td>
                      <Td className={`text-right tabular-nums ${allColor}`}>
                        {r.allTimePct != null ? `${sign(r.allTimePct)}${pct(r.allTimePct)}%` : '—'}
                        <div className="text-[11px] font-normal mt-0.5">
                          {r.allTimeAbs == null ? '' : hidden ? REDACTED : `${sign(r.allTimeAbs)}$${cur(r.allTimeAbs)}`}
                        </div>
                      </Td>
                      <Td className="text-right tabular-nums text-[var(--text)] font-semibold">
                        {r.value > 0 ? (hidden ? REDACTED : `$${cur(r.value)}`) : '—'}
                      </Td>
                      <Td className="text-right text-xs text-[var(--text-muted)] tabular-nums">
                        {r.shares != null && (
                          <>
                            {r.shares} sh
                            {r.cost_basis != null && ` @ $${r.cost_basis.toFixed(2)}`}
                          </>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
