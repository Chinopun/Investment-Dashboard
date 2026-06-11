'use client';

import { usePortfolio } from '@/lib/usePortfolio';
import { PageHeader } from '@/components/PageHeader';
import { SummaryCards } from '@/components/SummaryCards';
import { HoldingsPieChart } from '@/components/HoldingsPieChart';
import { SectorBreakdown } from '@/components/SectorBreakdown';
import Link from 'next/link';
import { sign, pct, cur, REDACTED } from '@/lib/format';
import { usePrivacy } from '@/store/theme';
import { format } from 'date-fns';

export default function Dashboard() {
  const { holdings, quotes, totals, loading } = usePortfolio();
  const [hidden] = usePrivacy();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Compute top movers (by day pct, abs).
  const movers = holdings
    .map((h) => {
      const q = quotes[h.ticker];
      return { ticker: h.ticker, name: q?.name ?? h.name, change_pct: q?.change_pct ?? null };
    })
    .filter((r) => r.change_pct != null)
    .sort((a, b) => Math.abs(b.change_pct!) - Math.abs(a.change_pct!))
    .slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A bird's-eye view of your portfolio." />

      <div className="px-6 py-6 space-y-6">
        <SummaryCards totals={totals} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel
            title="Holdings breakdown"
            subtitle="Each position by current market value"
            href="/portfolio"
          >
            {loading
              ? <Skeleton h="h-72" />
              : <HoldingsPieChart holdings={holdings} quotes={quotes} />}
          </Panel>

          <Panel
            title="By sector"
            subtitle="Where your dollars are concentrated"
          >
            {loading
              ? <Skeleton h="h-56" />
              : <SectorBreakdown holdings={holdings} quotes={quotes} />}
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Today's movers" subtitle="Biggest absolute % moves" href="/portfolio">
            <ul className="divide-y divide-[var(--border)]">
              {movers.length === 0 && (
                <li className="py-3 text-sm text-[var(--text-muted)]">Live quotes loading…</li>
              )}
              {movers.map((m) => (
                <li key={m.ticker}>
                  <Link
                    href={`/stock/${m.ticker}`}
                    className="flex items-center justify-between py-2 text-sm hover:bg-[var(--bg)] -mx-2 px-2 rounded"
                  >
                    <div>
                      <div className="font-semibold text-[var(--text)]">{m.ticker}</div>
                      <div className="text-[var(--text-muted)] text-xs truncate max-w-[200px]">{m.name}</div>
                    </div>
                    <div
                      className={
                        (m.change_pct! >= 0 ? 'text-[var(--pos)]' : 'text-[var(--neg)]') +
                        ' font-semibold'
                      }
                    >
                      {sign(m.change_pct!)}{pct(m.change_pct!)}%
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Today's digest"
            subtitle={format(new Date(), 'EEEE, MMM d')}
            href={`/digests/${today}`}
          >
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Read the AI-curated morning brief on the most material developments across your holdings.
            </p>
            <Link
              href={`/digests/${today}`}
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold"
            >
              Open digest →
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Panel({
  title, subtitle, children, href,
}: { title: string; subtitle?: string; children: React.ReactNode; href?: string }) {
  return (
    <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">{title}</h2>
          {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="text-xs text-[var(--accent)] font-semibold">
            See more →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function Skeleton({ h }: { h: string }) {
  return <div className={`${h} animate-pulse rounded-lg bg-[var(--bg)]`} />;
}
