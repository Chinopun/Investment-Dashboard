'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';

type Row = { digest_date: string; subject_line: string; sent_at: string | null };

export default function DigestsIndex() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const { data } = await supabase
          .from('daily_digests')
          .select('digest_date, subject_line, sent_at')
          .eq('user_id', userId)
          .order('digest_date', { ascending: false })
          .limit(60);
        setRows((data ?? []) as Row[]);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <>
      <PageHeader title="Digests" subtitle="Every morning brief, archived." />
      <div className="px-6 py-6">
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
          {loading && <div className="p-6 text-sm text-[var(--text-muted)]">Loading…</div>}
          {!loading && rows.length === 0 && (
            <div className="p-6 text-sm text-[var(--text-muted)]">
              No digests yet. The morning digest runs daily at 8 AM Bangkok.
            </div>
          )}
          <ul>
            {rows.map((r) => {
              const niceDate = (() => {
                try { return format(parseISO(r.digest_date), 'EEEE, MMM d'); } catch { return r.digest_date; }
              })();
              return (
                <li key={r.digest_date} className="border-b border-[var(--border)] last:border-b-0">
                  <Link
                    href={`/digests/${r.digest_date}`}
                    className="block px-5 py-4 hover:bg-[var(--bg)] transition"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                      {niceDate}
                    </div>
                    <div className="text-sm font-semibold text-[var(--text)] mt-1 line-clamp-2">
                      {r.subject_line}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
