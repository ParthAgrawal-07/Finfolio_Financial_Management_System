/**
 * MarketsPage — Live market overview with price ticker, sector heatmap,
 * and stock screener table.
 */
import { useMarketData, formatCurrency } from "../../hooks/useMockData";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { clsx } from "clsx";

export function MarketsPage() {
  const { data: stocks, loading } = useMarketData();

  const gainers  = [...stocks].sort((a, b) => b.change_pct - a.change_pct).slice(0, 3);
  const losers   = [...stocks].sort((a, b) => a.change_pct - b.change_pct).slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Market Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time stock prices and market movers</p>
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-accent-green/20 text-accent-green flex items-center gap-1">
          <Activity size={12} /> MARKETS OPEN
        </span>
      </div>

      {/* ── Top Movers ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Gainers */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-accent-green mb-3 flex items-center gap-2"><TrendingUp size={14} /> Top Gainers</h2>
          <div className="space-y-3">
            {loading ? [...Array(3)].map((_,i) => <div key={i} className="skeleton h-12 w-full rounded-xl" />) :
              gainers.map(s => (
                <div key={s.ticker} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent-green/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent-green">{s.ticker.slice(0,2)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{s.ticker}</p>
                      <p className="text-xs text-slate-400">{s.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-white">${s.price.toFixed(2)}</p>
                    <p className="text-xs font-mono text-accent-green">+{s.change_pct.toFixed(2)}%</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Top Losers */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-accent-red mb-3 flex items-center gap-2"><TrendingDown size={14} /> Top Losers</h2>
          <div className="space-y-3">
            {loading ? [...Array(3)].map((_,i) => <div key={i} className="skeleton h-12 w-full rounded-xl" />) :
              losers.map(s => (
                <div key={s.ticker} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent-red/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent-red">{s.ticker.slice(0,2)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{s.ticker}</p>
                      <p className="text-xs text-slate-400">{s.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-white">${s.price.toFixed(2)}</p>
                    <p className="text-xs font-mono text-accent-red">{s.change_pct.toFixed(2)}%</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* ── Full Stock Table ───────────────────────────── */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold text-base mb-1">Stock Screener</h2>
        <p className="text-xs text-slate-400 mb-5">All tracked securities with live price data</p>
        {loading ? (
          <div className="space-y-3">{[...Array(8)].map((_,i) => <div key={i} className="skeleton h-12 w-full rounded-xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-tl-lg">Symbol</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Change</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4 text-right rounded-tr-lg">Mkt Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stocks.map(s => {
                  const isUp = s.change >= 0;
                  return (
                    <tr key={s.ticker} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={clsx("w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold", isUp ? "bg-accent-green/10 text-accent-green" : "bg-accent-red/10 text-accent-red")}>
                            {s.ticker.slice(0,2)}
                          </div>
                          <span className="text-sm font-bold text-white">{s.ticker}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300 whitespace-nowrap">{s.name}</td>
                      <td className="py-3 px-4 whitespace-nowrap"><span className="badge-neutral">{s.sector}</span></td>
                      <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-white whitespace-nowrap">${s.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className={clsx("flex items-center justify-end gap-1 text-sm font-mono", isUp ? "text-accent-green" : "text-accent-red")}>
                          {isUp ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                          {isUp ? "+" : ""}{s.change.toFixed(2)} ({isUp ? "+" : ""}{s.change_pct.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-slate-400 whitespace-nowrap">{s.volume}</td>
                      <td className="py-3 px-4 text-right text-sm font-mono text-brand-400 whitespace-nowrap">{s.market_cap}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
