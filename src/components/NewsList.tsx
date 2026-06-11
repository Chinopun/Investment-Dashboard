'use client';

import { formatDistanceToNow } from 'date-fns';
import type { NewsArticle } from '@/lib/types';

const SENT_COLOR: Record<string, string> = {
  positive: 'var(--pos)',
  negative: 'var(--neg)',
  neutral: 'var(--text-muted)',
};

export function NewsList({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) {
    return <div className="p-6 text-sm text-[var(--text-muted)]">No news yet.</div>;
  }
  return (
    <ul>
      {articles.map((a) => {
        const sentiment = a.sentiment ?? 'neutral';
        const time = (() => {
          try { return formatDistanceToNow(new Date(a.published_at), { addSuffix: true }); } catch { return ''; }
        })();
        return (
          <li
            key={a.id}
            className="relative border-b border-[var(--border)] last:border-b-0 px-5 py-4 hover:bg-[var(--bg)] transition"
          >
            <span
              className="absolute left-1 top-5 w-1 h-8 rounded"
              style={{ backgroundColor: SENT_COLOR[sentiment] }}
            />
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-1.5">
              <span className="font-bold text-[var(--accent)]">{a.ticker}</span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-[var(--text-secondary)] capitalize">{a.source}</span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-[var(--text-muted)]">{time}</span>
              {!!a.impact_score && a.impact_score >= 70 && (
                <span className="ml-auto text-[var(--neg)] font-semibold">🔔 high impact</span>
              )}
            </div>
            <a href={a.url} target="_blank" rel="noopener noreferrer">
              <h3 className="text-sm font-semibold text-[var(--text)] leading-snug">{a.headline}</h3>
              {a.summary && (
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                  {a.summary}
                </p>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
