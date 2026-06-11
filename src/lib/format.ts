// Small set of formatters used everywhere so signs + decimals stay consistent.

export const sign = (n: number) => (n >= 0 ? '+' : '-');

export function cur(n: number): string {
  return Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function pct(n: number): string {
  return Math.abs(n).toFixed(2);
}

export function dollars(n: number, withSign = false): string {
  const s = withSign ? `${sign(n)}$${cur(n)}` : `$${cur(n)}`;
  return s;
}

export function pctStr(n: number, withSign = true): string {
  return withSign ? `${sign(n)}${pct(n)}%` : `${pct(n)}%`;
}

export const REDACTED = '•••••';
