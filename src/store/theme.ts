// Theme + privacy preferences, persisted in localStorage.
// Exposed as a tiny event-emitter so any component can subscribe.

'use client';

import { useEffect, useState } from 'react';

type Sub = () => void;

class Store<T> {
  private state: T;
  private subs = new Set<Sub>();

  constructor(initial: T) { this.state = initial; }

  get(): T { return this.state; }
  set(next: Partial<T>): void {
    this.state = { ...this.state, ...next };
    this.subs.forEach((s) => s());
  }
  subscribe(s: Sub): () => void {
    this.subs.add(s);
    return () => this.subs.delete(s);
  }
}

export type ThemeMode = 'system' | 'light' | 'dark';

const themeStore = new Store<{ mode: ThemeMode }>({ mode: 'system' });
const privacyStore = new Store<{ hidden: boolean }>({ hidden: false });

if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme.mode');
  if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
    themeStore.set({ mode: savedTheme });
  }
  const savedHidden = localStorage.getItem('privacy.hidden');
  if (savedHidden === '1') privacyStore.set({ hidden: true });
}

export function useThemeMode(): [ThemeMode, (m: ThemeMode) => void] {
  const [mode, set] = useState<ThemeMode>(themeStore.get().mode);
  useEffect(() => themeStore.subscribe(() => set(themeStore.get().mode)), []);
  return [mode, (m: ThemeMode) => {
    themeStore.set({ mode: m });
    if (typeof window !== 'undefined') localStorage.setItem('theme.mode', m);
  }];
}

export function usePrivacy(): [boolean, () => void] {
  const [hidden, set] = useState<boolean>(privacyStore.get().hidden);
  useEffect(() => privacyStore.subscribe(() => set(privacyStore.get().hidden)), []);
  return [hidden, () => {
    const next = !privacyStore.get().hidden;
    privacyStore.set({ hidden: next });
    if (typeof window !== 'undefined') localStorage.setItem('privacy.hidden', next ? '1' : '0');
  }];
}

// Returns whether dark mode is actually active, accounting for the 'system' setting.
export function useIsDark(): boolean {
  const [mode] = useThemeMode();
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mode === 'dark' || (mode === 'system' && systemDark);
}
