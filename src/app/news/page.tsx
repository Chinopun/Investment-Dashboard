'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { NewsList } from '@/components/NewsList';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import type { NewsArticle } from '@/lib/types';

export default function NewsPage() {
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const { data: holdings } = await supabase
          .from('holdings').select('ticker').eq('user_id', userId);
        const tickers = (holdings ?? []).map((r) => r.ticker);
        if (!tickers.length) return;
        const { data } = await supabase
          .from('news_articles').select('*')
          .in('ticker', tickers)
          .order('published_at', { ascending: false })
          .limit(200);
        if (!cancelled) setItems((data ?? []) as NewsArticle[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <PageHeader title="News" subtitle="Combined feed from every source, latest first." />
      <div className="px-6 py-6">
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-[var(--text-muted)]">Loading…</div>
          ) : (
            <NewsList articles={items} />
          )}
        </div>
      </div>
    </>
  );
}
