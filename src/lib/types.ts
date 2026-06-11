// Mirrors the Supabase Postgres schema from the iOS app.

export type Holding = {
  id: string;
  user_id: string;
  ticker: string;
  name: string | null;
  shares: number | null;
  cost_basis: number | null;
  alert_breaking: boolean;
  created_at: string;
};

export type NewsArticle = {
  id: string;
  ticker: string;
  source: string;
  url: string;
  headline: string;
  body_snippet: string | null;
  summary: string | null;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  impact_score: number | null;
  published_at: string;
  fetched_at: string;
};

export type DailyDigest = {
  id: string;
  user_id: string;
  digest_date: string;
  body_md: string;
  subject_line: string;
  price_moves: Record<string, { close: number; change_pct: number }>;
  sent_at: string | null;
  created_at: string;
};

export type Quote = {
  ticker: string;
  price: number;
  change: number;
  change_pct: number;
  prev_close: number;
  currency: string;
  name?: string;
};

export type Candle = { t: number; close: number };

export type ChartData = {
  candles: Candle[];
  changePct: number | null;
  changeAbs: number | null;
};

export type SectorInfo = {
  ticker: string;
  sector: string;       // mapped to a coarse-grained category for the breakdown
  industry: string;     // Finnhub's more specific label
  marketCap?: number;
  weburl?: string;
};
