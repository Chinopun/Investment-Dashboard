'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { supabase, getCurrentUserId, USER_EMAIL } from '@/lib/supabase';
import { useThemeMode, usePrivacy, type ThemeMode } from '@/store/theme';

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsPage() {
  const [mode, setMode] = useThemeMode();
  const [hidden, toggleHidden] = usePrivacy();
  const [notifyTime, setNotifyTime] = useState('08:00');
  const [tz, setTz] = useState('Asia/Bangkok');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const id = await getCurrentUserId();
      if (!id) return;
      const { data } = await supabase
        .from('users').select('notify_time, tz').eq('id', id).maybeSingle();
      if (data) {
        setNotifyTime(String(data.notify_time).slice(0, 5));
        setTz(data.tz);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const id = await getCurrentUserId();
      if (!id) return;
      await supabase
        .from('users')
        .update({ notify_time: notifyTime + ':00', tz })
        .eq('id', id);
      alert('Saved.');
    } finally { setSaving(false); }
  }

  return (
    <>
      <PageHeader title="Settings" />
      <div className="px-6 py-6 max-w-2xl space-y-6">
        <Section title="Account">
          <Row label="Email">
            <span className="text-sm text-[var(--text)]">{USER_EMAIL}</span>
          </Row>
        </Section>

        <Section title="Appearance">
          <Row label="Theme">
            <div className="flex gap-2">
              {THEMES.map((t) => {
                const on = mode === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setMode(t.value)}
                    className={
                      'px-4 py-2 rounded-lg text-sm font-semibold ' +
                      (on ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:bg-[var(--border)]')
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Row>
          <Row label="Privacy">
            <button
              onClick={toggleHidden}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--border)]"
            >
              {hidden ? 'Show all $ amounts' : 'Hide all $ amounts'}
            </button>
          </Row>
        </Section>

        <Section title="Morning digest">
          <Row label="Time (24h)">
            <input
              value={notifyTime}
              onChange={(e) => setNotifyTime(e.target.value)}
              placeholder="08:00"
              className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] w-32"
            />
          </Row>
          <Row label="Time zone">
            <input
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              placeholder="Asia/Bangkok"
              className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] w-60"
            />
          </Row>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </Section>

        <Section title="About">
          <div className="text-xs text-[var(--text-muted)] leading-relaxed">
            <p>
              This is a read-mostly view onto your Supabase backend. Holdings, news,
              and digests are managed by the same pipeline that powers the iOS app.
            </p>
            <p className="mt-2">
              Notify-time changes are written to <code className="text-[var(--text-secondary)]">public.users</code> in Supabase.
            </p>
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5">
      <h2 className="text-base font-bold text-[var(--text)] mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-xs uppercase tracking-widest text-[var(--text-muted)]">{label}</div>
      <div>{children}</div>
    </div>
  );
}
