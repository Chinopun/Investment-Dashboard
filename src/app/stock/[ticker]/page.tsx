'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchQuotes, fetchChart } from '@/lib/prices';
import { supabase } from '@/lib/supabase';
import { fetchSector } from '@/lib/sectors';
import type { ChartData, NewsArticle, Quote, SectorInfo } from '@/lib/types';
import { StockChart } from '@/components/StockChart';
import { NewsList } from '@/components/NewsList';

type Range = '1d' | '5d' | '1mo' | '6mo' | '1y';
const RANGES: Range[] = ['1d', '5d', '1mo', '6mo', '1y'];

export default function StockDetail({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const t = ticker.toUpperCase();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [active, setActive] = useState<Range>('1d');
  const [chartByRange, setChart] = useState<Record<Range, ChartData | null>>({
    '1d': null, '5d': null, '1mo': null, '6mo': null, '1y': null,
  });
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [sector, setSector] = useState<SectorInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [qs, c1d, c5d, c1mo, c6mo, c1y, { data: newsRows }, sec] = await Promise.all([
        fetchQuotes([t]),
        fetchChart(t, '1d'),
        fetchChart(t, '5d'),
        fetchChart(t, '1mo'),
        fetchChart(t, '6mo'),
        fetchChart(t, '1y'),
        supabase.from('news_articles').select('*').eq('ticker', t)
          .order('published_at', { ascending: false }).limit(60),
        fetchSector(t),
      ]);
      if (cancelled) return;
      setQuote(qs[0] ?? null);
      setChart({ '1d': c1d, '5d': c5d, '1mo': c1mo, '6mo': c6mo, '1y': c1y });
      setNews((newsRows ?? []) as NewsArticle[]);
      setSector(sec);
    })();
    return () => { cancelled = true; };
  }, [t]);

  const positive = (quote?.change_pct ?? 0) >= 0;
  const activeChart = chartByRange[active];

  return (
    <>
      <div className="px-6 pt-6 pb-2 flex items-center gap-2 text-sm">
        <Link href="/portfolio" className="text-[var(--accent)] flex items-center gap-1">
          <ArrowLeft size={14} /> Portfolio
        </Link>
      </div>

      <div className="px-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-[var(--text)]">{t}</h1>
          {sector?.sector && (
            <span className="rounded-full bg-[var(--bg)] text-[var(--text-secondary)] px-2 py-0.5 text-xs">
              {sector.sector}
            </span>
          )}
        </div>
        <div className="text-sm text-[var(--text-secondary)] mt-1">{quote?.name ?? ''}</div>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-[var(--text)]">
            {quote ? `$${quote.price.toFixed(2)}` : '—'}
          </span>
          {quote && (
            <span className={positive ? 'text-[var(--pos)]' : 'text-[var(--neg)]'}>
              {positive ? '+' : ''}{quote.change.toFixed(2)} ({quote.change_pct.toFixed(2)}%) today
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5">
          <StockChart
            candles={activeChart?.candles ?? []}
            positive={(activeChart?.changePct ?? 0) >= 0}
          />
          <div className="grid grid-cols-5 gap-2 mt-4">
            {RANGES.map((r) => {
              const data = chartByRange[r];
              const on = active === r;
              const pct = data?.changePct;
              const color = pct == null
                ? 'text-[var(--text-muted)]'
                : pct >= 0 ? 'text-[var(--pos)]' : 'text-[var(--neg)]';
              return (
                <button
                  key={r}
                  onClick={() => setActive(r)}
                  className={
                    'flex flex-col items-center rounded-xl py-2 text-xs ' +
                    (on
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg)] hover:bg-[var(--border)]')
                  }
                >
                  <span className={'uppercase tracking-wider ' + (on ? 'text-white' : 'text-[var(--text-secondary)]')}>
                    {r}
                  </span>
                  <span className={'font-bold ' + (on ? 'text-white' : color)}>
                    {pct == null ? '…' : `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-bold text-[var(--text)]">Recent news</h2>
          </div>
          <NewsList articles={news} />
        </div>
      </div>
    </>
  );
}
