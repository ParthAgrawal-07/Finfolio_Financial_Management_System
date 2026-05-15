/**
 * Holdings Table Component
 * Full portfolio holdings with PnL, sortable columns, sector badges.
 */

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Holding, formatCurrency } from "../hooks/useMockData";
import { clsx } from "clsx";

interface HoldingsTableProps {
  holdings: Holding[];
  loading: boolean;
}

type SortKey = keyof Holding;
type SortDir = "asc" | "desc";

const SECTOR_COLORS: Record<string, string> = {
  "Technology":     "bg-brand-500/20 text-brand-300",
  "Financials":     "bg-accent-cyan/20 text-accent-cyan",
  "Consumer Disc.": "bg-accent-amber/20 text-accent-amber",
  "Healthcare":     "bg-accent-green/20 text-accent-green",
  "Energy":         "bg-orange-500/20 text-orange-400",
};

export function HoldingsTable({ holdings, loading }: HoldingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("unrealised_pnl");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...holdings].sort((a, b) => {
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown size={12} className="text-slate-600" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-brand-400" />
      : <ChevronDown size={12} className="text-brand-400" />;
  }

  const headers: Array<{ key: SortKey; label: string; align?: string }> = [
    { key: "ticker_symbol",    label: "Symbol"        },
    { key: "sector",           label: "Sector"        },
    { key: "quantity_owned",   label: "Qty",     align: "right" },
    { key: "average_buy_price",label: "Avg Cost", align: "right" },
    { key: "current_price",    label: "Price",   align: "right" },
    { key: "market_value",     label: "Value",   align: "right" },
    { key: "unrealised_pnl",   label: "PnL",     align: "right" },
    { key: "pnl_percentage",   label: "Return",  align: "right" },
  ];

  if (loading) {
    return (
      <div id="holdings-table" className="glass-card p-6">
        <div className="skeleton h-5 w-48 mb-5" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-white/5">
            {[...Array(8)].map((_, j) => (
              <div key={j} className="skeleton h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="holdings-table" className="glass-card p-6 animate-fade-in-up stagger-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold text-base">Portfolio Holdings</h2>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">{holdings.length} positions</span>
          <span className="badge-neutral">Cached 60s</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h.key}
                  className={clsx("cursor-pointer select-none group", h.align === "right" && "text-right")}
                  onClick={() => handleSort(h.key)}
                >
                  <span className="flex items-center gap-1 w-fit" style={h.align === "right" ? { marginLeft: "auto" } : {}}>
                    {h.label}
                    <SortIcon col={h.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((h, i) => {
              const isUp = h.unrealised_pnl >= 0;
              return (
                <tr
                  key={h.security_id}
                  id={`holding-row-${h.ticker_symbol}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Ticker */}
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-[10px] font-bold text-brand-300 flex-shrink-0">
                        {h.ticker_symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{h.ticker_symbol}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{h.security_name}</p>
                      </div>
                    </div>
                  </td>

                  {/* Sector */}
                  <td>
                    <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-semibold", SECTOR_COLORS[h.sector] ?? "badge-neutral")}>
                      {h.sector}
                    </span>
                  </td>

                  {/* Qty */}
                  <td className="text-right font-mono text-slate-200">{h.quantity_owned}</td>

                  {/* Avg Cost */}
                  <td className="text-right font-mono text-slate-300">{formatCurrency(h.average_buy_price)}</td>

                  {/* Current Price */}
                  <td className="text-right font-mono text-white font-medium">{formatCurrency(h.current_price)}</td>

                  {/* Market Value */}
                  <td className="text-right font-mono text-slate-200">{formatCurrency(h.market_value)}</td>

                  {/* Unrealized PnL */}
                  <td className={clsx("text-right font-mono font-semibold", isUp ? "text-accent-green" : "text-accent-red")}>
                    {isUp ? "+" : ""}{formatCurrency(h.unrealised_pnl)}
                  </td>

                  {/* Return % */}
                  <td className="text-right">
                    <span className={isUp ? "badge-positive" : "badge-negative"}>
                      {isUp ? "+" : ""}{h.pnl_percentage.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
