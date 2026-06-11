'use client';

import { useEffect } from 'react';
import { useIsDark } from '@/store/theme';

// Toggles the `dark` class on <html> so Tailwind's `dark:` variants kick in.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDark = useIsDark();
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);
  return <>{children}</>;
}
