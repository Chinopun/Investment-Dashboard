'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Candle } from '@/lib/types';

export function StockChart({ candles, positive }: { candles: Candle[]; positive: boolean }) {
  if (candles.length < 2) return <div className="h-64" />;
  const data = candles.map((c) => ({ t: c.t, close: c.close }));
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <XAxis dataKey="t" hide />
          <YAxis
            domain={['dataMin', 'dataMax']}
            width={50}
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v as number).toFixed(0)}`}
          />
          <Tooltip
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const close = payload[0].value as number;
              return (
                <div className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs shadow">
                  <span className="text-[var(--text)] font-semibold">${close.toFixed(2)}</span>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke={positive ? 'var(--pos)' : 'var(--neg)'}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
