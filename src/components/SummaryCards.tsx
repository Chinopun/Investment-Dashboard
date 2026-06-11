'use client';

import { cur, pct, sign, REDACTED } from '@/lib/format';
import { usePrivacy } from '@/store/theme';

type Totals = {
  totalValue: number;
  totalDay: number;
  dayPct: number | null;
  allTimeAbs: number | null;
  allTimePct: number | null;
};

export function SummaryCards({ totals }: { totals: Totals }) {
  const [hidden] = usePrivacy();
  const dayColor = totals.totalDay >= 0 ? 'text-[var(--pos)]' : 'text-[var(--neg)]';
  const allColor =
    totals.allTimeAbs == null ? 'text-[var(--text-secondary)]'
    : totals.allTimeAbs >= 0 ? 'text-[var(--pos)]' : 'text-[var(--neg)]';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card label="Total value">
        <div className="text-3xl font-bold text-[var(--text)]">
          {hidden ? REDACTED : `$${cur(totals.totalValue)}`}
        </div>
      </Card>

      <Card label="Today">
        <div className={`text-xl font-bold ${dayColor}`}>
          {totals.dayPct != null ? `${sign(totals.dayPct)}${pct(totals.dayPct)}%` : '—'}
        </div>
        <div className={`text-sm mt-1 ${dayColor}`}>
          {hidden ? REDACTED : `${sign(totals.totalDay)}$${cur(totals.totalDay)}`}
        </div>
      </Card>

      <Card label="All time">
        <div className={`text-xl font-bold ${allColor}`}>
          {totals.allTimePct != null
            ? `${sign(totals.allTimePct)}${pct(totals.allTimePct)}%`
            : '—'}
        </div>
        <div className={`text-sm mt-1 ${allColor}`}>
          {totals.allTimeAbs == null
            ? <span className="text-[var(--text-muted)]">add cost basis to track</span>
            : hidden ? REDACTED : `${sign(totals.allTimeAbs)}$${cur(totals.allTimeAbs)}`}
        </div>
      </Card>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5">
      <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}
