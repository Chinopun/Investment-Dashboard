import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar, MobileNav } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Investment Dashboard',
  description: 'Personal stock portfolio dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var m = localStorage.getItem('theme.mode') || 'system';
                var sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (m === 'dark' || (m === 'system' && sys)) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col md:flex-row">
        <ThemeProvider>
          <Sidebar />
          <main className="flex-1 min-h-screen overflow-x-hidden">
            {children}
          </main>
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
