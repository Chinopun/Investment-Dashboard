'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase, getCurrentUserId } from './supabase';
import { fetchQuotes } from './prices';
import type { Holding, Quote } from './types';

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) { setHoldings([]); setQuotes({}); return; }

      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId)
        .order('ticker');
      if (error) throw error;
      const hs = (data ?? []) as Holding[];
      setHoldings(hs);

      const tickers = hs.map((h) => h.ticker);
      if (tickers.length) {
        try {
          const qs = await fetchQuotes(tickers);
          setQuotes(Object.fromEntries(qs.map((q) => [q.ticker, q])));
        } catch (e) {
          console.warn('quote fetch failed', e);
        }
      }
    } catch (e) {
      console.warn('portfolio refresh failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Computed totals.
  let totalValue = 0;
  let totalDay = 0;
  let trackedCost = 0;
  let trackedValueNow = 0;
  let prevTotalValue = 0;
  for (const h of holdings) {
    const q = quotes[h.ticker];
    if (q && h.shares != null) {
      const positionValue = q.price * h.shares;
      const positionDay = q.change * h.shares;
      totalValue += positionValue;
      totalDay += positionDay;
      prevTotalValue += q.prev_close * h.shares;
      if (h.cost_basis != null) {
        trackedCost += h.cost_basis * h.shares;
        trackedValueNow += positionValue;
      }
    }
  }
  const dayPct = prevTotalValue > 0 ? (totalDay / prevTotalValue) * 100 : null;
  const allTimeAbs = trackedCost > 0 ? trackedValueNow - trackedCost : null;
  const allTimePct = trackedCost > 0 && allTimeAbs != null ? (allTimeAbs / trackedCost) * 100 : null;

  return {
    holdings, quotes, loading, refresh,
    totals: { totalValue, totalDay, dayPct, allTimeAbs, allTimePct },
  };
}
