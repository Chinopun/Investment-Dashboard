export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-6 pt-8 pb-4 border-b border-[var(--border)]">
      <h1 className="text-3xl font-bold text-[var(--text)] tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
    </div>
  );
}
