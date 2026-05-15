/**
 * PnL Card Component
 * Displays total unrealized PnL and total market value
 * with animated number display and glow effects.
 */

import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { formatCurrency } from "../hooks/useMockData";
import { clsx } from "clsx";

interface PnLCardProps {
  totalPnL: number;
  totalMarketValue: number;
  cached: boolean;
  loading: boolean;
}

function SkeletonStat() {
  return (
    <div className="stat-card opacity-100">
      <div className="skeleton h-4 w-24 mb-2" />
      <div className="skeleton h-8 w-40" />
      <div className="skeleton h-3 w-28 mt-1" />
    </div>
  );
}

export function PnLCard({ totalPnL, totalMarketValue, cached, loading }: PnLCardProps) {
  const isPositive = totalPnL >= 0;
  const pnlPercent = ((totalPnL / (totalMarketValue - totalPnL)) * 100).toFixed(2);

  if (loading) {
    return (
      <>
        <SkeletonStat />
        <SkeletonStat />
      </>
    );
  }

  return (
    <>
      {/* Total Unrealized PnL */}
      <div
        id="pnl-card-total"
        className={clsx(
          "stat-card stagger-1",
          isPositive
            ? "border-accent-green/20"
            : "border-accent-red/20"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Unrealized P&amp;L
          </span>
          <span
            className={clsx(
              "flex items-center justify-center w-8 h-8 rounded-xl",
              isPositive ? "bg-accent-green/15 text-accent-green" : "bg-accent-red/15 text-accent-red"
            )}
          >
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </span>
        </div>

        {/* Value */}
        <div>
          <p
            className={clsx(
              "text-3xl font-bold tracking-tight font-mono",
              isPositive ? "text-accent-green" : "text-accent-red"
            )}
          >
            {isPositive ? "+" : ""}{formatCurrency(totalPnL)}
          </p>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
            <span
              className={clsx(
                "font-semibold",
                isPositive ? "text-accent-green" : "text-accent-red"
              )}
            >
              {isPositive ? "▲" : "▼"} {Math.abs(parseFloat(pnlPercent))}%
            </span>
            <span>overall return</span>
          </p>
        </div>

        {/* Cache indicator */}
        {cached && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/20 w-fit">
            ⚡ Redis cached
          </span>
        )}
      </div>

      {/* Total Market Value */}
      <div id="pnl-card-market-value" className="stat-card stagger-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Portfolio Value
          </span>
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-500/15 text-brand-400">
            <DollarSign size={16} />
          </span>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight font-mono text-white">
            {formatCurrency(totalMarketValue)}
          </p>
          <p className="text-slate-400 text-sm mt-1">Total market value</p>
        </div>

        {/* Mini sparkline visual */}
        <div className="flex items-end gap-0.5 h-8 mt-1">
          {[40,55,48,62,70,65,80,88,75,92,85,100].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-brand-500/30 hover:bg-brand-500/60 transition-colors"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Active Positions */}
      <div id="pnl-card-positions" className="stat-card stagger-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Positions
          </span>
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent-cyan/15 text-accent-cyan">
            <Activity size={16} />
          </span>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight text-white">10</p>
          <p className="text-slate-400 text-sm mt-1">Across 5 sectors</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Tech","Fin","Energy","Health","Cons."].map((s) => (
            <span key={s} className="badge-neutral">{s}</span>
          ))}
        </div>
      </div>
    </>
  );
}
