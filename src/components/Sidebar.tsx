'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ListOrdered, Newspaper, ScrollText, Settings, EyeOff, Eye,
} from 'lucide-react';
import { usePrivacy } from '@/store/theme';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: ListOrdered },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/digests', label: 'Digests', icon: ScrollText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [hidden, toggleHidden] = usePrivacy();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] py-6 px-3">
      <div className="px-3 pb-6">
        <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Investment</div>
        <div className="text-lg font-bold text-[var(--text)]">Dashboard</div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ' +
                (active
                  ? 'bg-[var(--accent)] text-white font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text)]')
              }
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-1">
        <button
          onClick={toggleHidden}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg)]"
        >
          {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
          {hidden ? 'Show $ amounts' : 'Hide $ amounts'}
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="md:hidden flex items-center justify-around border-t border-[var(--border)] bg-[var(--card)] px-2 py-2 sticky bottom-0">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={
              'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ' +
              (active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')
            }
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
