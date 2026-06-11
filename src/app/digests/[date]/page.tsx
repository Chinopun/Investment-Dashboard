'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import type { DailyDigest } from '@/lib/types';
import { format, parseISO } from 'date-fns';

export default function DigestDetail({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const userId = await getCurrentUserId();
      if (!userId || !date) { setLoading(false); return; }
      const { data } = await supabase
        .from('daily_digests')
        .select('*')
        .eq('user_id', userId)
        .eq('digest_date', date)
        .maybeSingle();
      setDigest((data ?? null) as DailyDigest | null);
      setLoading(false);
    })();
  }, [date]);

  const title = (() => {
    try { return format(parseISO(date), 'EEEE, MMMM d'); } catch { return date; }
  })();

  return (
    <>
      <div className="px-6 pt-6 pb-2 flex items-center gap-2 text-sm">
        <Link href="/digests" className="text-[var(--accent)] flex items-center gap-1">
          <ArrowLeft size={14} /> All digests
        </Link>
      </div>
      <div className="px-6 pt-2 pb-4 border-b border-[var(--border)]">
        <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">
          {title}
        </div>
        {digest && (
          <h1 className="text-2xl font-bold text-[var(--text)] leading-tight">
            {digest.subject_line}
          </h1>
        )}
      </div>

      <div className="px-6 py-6 max-w-3xl">
        {loading && <div className="text-sm text-[var(--text-muted)]">Loading…</div>}
        {!loading && !digest && (
          <p className="text-sm text-[var(--text-secondary)]">
            No digest for {date}.
          </p>
        )}
        {digest && (
          <article className="prose-digest">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {digest.body_md}
            </ReactMarkdown>
          </article>
        )}
      </div>

      <style jsx global>{`
        .prose-digest { color: var(--text); font-size: 15px; line-height: 1.7; }
        .prose-digest h1 { font-size: 24px; font-weight: 700; margin: 28px 0 12px; color: var(--text); }
        .prose-digest h2 { font-size: 19px; font-weight: 700; margin: 28px 0 8px; padding-bottom: 6px;
                            border-bottom: 1px solid var(--border); color: var(--text); }
        .prose-digest h3 { font-size: 16px; font-weight: 600; margin: 20px 0 6px; color: var(--text); }
        .prose-digest p { margin: 0 0 14px; }
        .prose-digest strong { font-weight: 700; }
        .prose-digest ul, .prose-digest ol { margin: 10px 0 14px 1.4em; }
        .prose-digest li { margin: 4px 0; }
        .prose-digest a { color: var(--accent); text-decoration: none; }
        .prose-digest a:hover { text-decoration: underline; }
        .prose-digest hr { border: none; border-top: 1px solid var(--border); margin: 22px 0; }
        .prose-digest blockquote {
          background: var(--card); border-left: 3px solid var(--accent);
          padding: 8px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;
        }
      `}</style>
    </>
  );
}
